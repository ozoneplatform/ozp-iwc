##IWC Debugger: Metrics
The metrics tool is a timeline plot of metrics gathered from the IWC Bus. The metrics are gathered as a singleton under
the `ozpIwc.wiring.metrics` module.


![img](../../assets/debugger_metrics.png)
_An example of tracking all packets sent out by the IWC Bus's Data Api module._


***
####Disable(0)
This button will toggle the plotting of metrics from the metrics module that are enabled in the **Metrics** list.

####Gather
Plots the current metrics from the metrics module on the enabled metrics in the **Metrics** list.

####Clear
Clears the Metrics timeline but not the metrics.

#### "Every Second" Dropdown
A dropdown to note how often to plot updates from the metrics module

####"1 minute" Dropdown
How long to retain points on the plot. By default after a plotted point has existed for 1 minute it will be removed.

####Filter
Filters the **Metrics** list using string matching.

####Select Filtered
Enables plotting on all of the metrics currently shown in the **Metrics** list.

####Deselect Filtered
Disables plotting on all of the metrics currently shown in the **Metrics** list.

