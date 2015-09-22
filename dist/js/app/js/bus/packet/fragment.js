/**
 * @module ozpIwc
 * @submodule ozpIwc.packet
 */


/**
 * Packet format for the data property of ozpIwc.packet.Network when working with fragmented packets.
 * @class Fragment
 * @namespace ozpIwc.packet
 */

/**
 * Flag for knowing this is a fragment packet. Should be true.
 * @property fragment
 * @type boolean
 */

/**
 * The msgId from the TransportPacket broken up into fragments.
 * @property msgId
 * @type Number
 */

/**
 * The position amongst other fragments of the TransportPacket.
 * @property id
 * @type Number
 */

/**
 * Total number of fragments of the TransportPacket expected.
 * @property total
 * @type Number
 */

/**
 * A segment of the TransportPacket in string form.
 * @property chunk
 * @type String
 */
