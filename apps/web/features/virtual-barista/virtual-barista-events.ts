export const OPEN_VIRTUAL_BARISTA = '52coffee:open-virtual-barista';

/** Open the existing widget without submitting a message or resetting its conversation. */
export function openVirtualBarista() {
  window.dispatchEvent(new Event(OPEN_VIRTUAL_BARISTA));
}
