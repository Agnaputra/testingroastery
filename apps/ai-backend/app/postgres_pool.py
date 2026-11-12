"""Bounded, reusable DBAPI connections for catalog, customer, and event requests."""
from contextlib import contextmanager

import psycopg2
from fastapi import HTTPException
from psycopg2.extras import RealDictCursor
from sqlalchemy import create_pool_from_url
from sqlalchemy.engine import make_url
from sqlalchemy.exc import SQLAlchemyError

from .config import settings

pool = create_pool_from_url(
    make_url(settings.DATABASE_URL).set(drivername="postgresql+psycopg2"),
    pool_size=5, max_overflow=0, pool_timeout=5,
    pool_pre_ping=True, pool_recycle=300, connect_args={"connect_timeout": 5},
)


@contextmanager
def connection(cursor_factory=RealDictCursor):
    try:
        lease = pool.connect()
    except (psycopg2.Error, SQLAlchemyError) as error:
        raise HTTPException(503, "Database sementara tidak tersedia. Coba lagi.") from error
    db = lease.dbapi_connection
    try:
        db.cursor_factory = cursor_factory
        with db:
            yield db
    finally:
        if db.closed:
            lease.invalidate()
        else:
            try:
                # Session settings and cursor shape must not leak to another request.
                db.cursor_factory = None
                db.set_session(isolation_level="READ COMMITTED", readonly=False, deferrable=False)
            except psycopg2.Error:
                lease.invalidate()
        lease.close()
