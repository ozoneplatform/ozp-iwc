#Inter Widget Communication

The Ozone Platform's Inter-Widget Communications (IWC) enables loosely coupled integration of web
applications by applying the best practices of enterprise service buses and service-oriented
architecture to a completely in-browser system that works across multiple tabs and windows.
Applications can share data and services then use the data and services offered by others to enrich
their own user experience.

####Lightweight Integration
Today’s rich web applications tend to carry more state than a simple link can convey, and
componentized development allows UI elements to be embedded, but at the cost of maintenance
and application size. The IWC allows application frontends to expose data and services to other
applications within the browser. Just like services on an ESB, these elements can be developed,
deployed, and extended without impact to other applications.

####Stays out of the way.
The IWC is designed to minimize the impact on your application. It is completely agnostic to the
application presentation, including a tiny client library that adds a single, invisible element to
your page. It uses standard web technologies requiring no browser plugins.