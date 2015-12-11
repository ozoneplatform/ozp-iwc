/**
 * If legacy applications are supported (OWF 7) the following functionality changes:
 *
 * - Structured Clone Support is removed.
 *
 */
if (ozpIwc.config.legacySupport) {
    ozpIwc.util.structuredCloneSupport = function () {
        return false;
    };
}
