##IWC Debugger: Traffic Snooper
The traffic snooper is a tool to track packets currently being passed throughout the IWC bus.

Clicking on a entry on the table will display the packet contents in the field below the table.

![img](../../assets/debugger_traffic.png)
_An example of tracking all packets sent out by the IWC Bus's Data Api module._


***
####Disable(0)
This button will toggle the traffic snooper's collection of packets.

####Clear
Clears the traffic snooper's log.

#### Packets Dropdown
The packet dropdown specifies how many packets to keep in the traffic snooper's log.

####Filter
The filter is a boolean expression check against all packets currently in the scope of the tracker. The
format of the object of each packet is as follows:
```
{
  "srcPeer": "255a2c2b",
  "sequence": 63,
  "data": {
    "ver": 1,
    "src": "names.api",
    "msgId": "p:6",
    "time": 1443558889271,
    "response": "ok",
    "replyTo": "p:25",
    "dst": "5b61f35.bc080a92"
  }
}
```

####Apply
Applies the filter to the table.