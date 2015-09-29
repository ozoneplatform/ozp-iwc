##IWC Debugger: Elections
The elections tool is a timeline plot of the IWC's distributed consensus algorithm determining which browser window
should be taking "leadership" of running the IWC bus. As a designated leader closes, a new leader must be determined to
retain the state of the bus. This plot gives a visual representation of what goes on during the eleciton process.


![img](../../assets/debugger_election.png)
_An example of leadership determination of the current IWC Bus._


***
####Enable
This button will toggle the plotting of election events.

####Plot Received Packets
Plots packets passing through the IWC along side the election events.

####Clear
Clears the Election timeline.

