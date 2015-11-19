// If running in a worker, there is no window, rather only self.
// Reassign window to self in this environment
if(!window){
    /*jshint -W020 */
    window = self;
}