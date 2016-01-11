// If running in a worker, there is no window, rather only self.
// Reassign window to self in this environment
try {
    // For IE: Throws error on trying to reassign window
    if (!window) {
        /*jshint -W020 */
        window = self;
    }
}catch (e){
    // For Chrome/FF: window is undefined and throws error on checking if falsy
    window = self;
}