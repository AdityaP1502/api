import Bugsnag from "@bugsnag/js";
import { connectToNetwork, connectToRouter } from "@ndn/autoconfig";
import { H3Transport } from "@ndn/quic-transport";
import { toHex } from "@ndn/util";
import galite from "ga-lite";

const session = toHex(crypto.getRandomValues(new Uint8Array(8)));
/**
 * @typedef {{
 *   a: "F"; // fetch response
 *   n: string, // file name
 *   d: number; // file duration in milliseconds
 *   sRtt: number;
 *   rto: number;
 *   cwnd: number;
 * }|{
 *   a: "E"; // fetch error
 *   n: string; // file name
 *   err: string;
 * }|{
 *   a: "P"; // playback
 *   n: string; // playlist name
 *   r: number; // resolution height
 *   fd: number; // decodedFrames
 *   fr: number; // droppedFrames
 *   be: number; // estimatedBandwidth in bps
 *   tl: number; // loadLatency in milliseconds
 *   tp: number; // playTime in milliseconds
 *   tu: number; // pauseTime in milliseconds
 *   tb: number; // bufferingTime in milliseconds
 * }} BeaconData
 */

/** @type {(data: BeaconData) => void} */
let postBeacon = () => undefined;

/**
 * Send beacon data.
 * @param {BeaconData} data
 */
export function sendBeacon(data) {
  data.sess = session;
  data.site = location.origin;
  data.remote = remote;
  if (data.a === "F" ){
    const Http = new XMLHttpRequest();
    const url = "http://localhost:5000/data"; 
    Http.open('POST', url);
    Http.setRequestHeader('Content-type', 'application/json');
    let payload = {
      a: data.a,
      r: data.r,
      fd: data.fd,
      fr: data.fr,
      be: data.be,
      tl: data.tl,
      tp: data.tp,
      tu: data.tu,
      tb: data.tb,
      sRtt: data.sRtt,
      rto: data.rto,
    };

    Http.send(JSON.stringify(payload));
    Http.onreadystatechange = (e) => {
      // console.log(payload);
      // console.log(Http.responseText);
    }
  }
  console.log(data);
  postBeacon(data);
}

if (location.hostname.endsWith(".ndn.today")) {
  const beaconServer = "https://ndnts-video-beacon.ndn.today";
  postBeacon = (data) => navigator.sendBeacon(`${beaconServer}/${JSON.stringify(data)}`);
  galite("create", "UA-935676-11", "auto");
  galite("send", "pageview");
  Bugsnag.start({ apiKey: "bd98c69a017a18043b500dedb640d9dc" });
} else {
  if (window.localStorage.getItem("beacon-console") === "1") {
    postBeacon = (data) => console.log(`BEACON ${JSON.stringify(data)}`);
  }
  Bugsnag.start({
    apiKey: "00000000000000000000000000000000",
    enabledReleaseStages: [],
  });
}

/** @type {string|undefined} */
export let remote;

export let data = [];
/**
 * Connect to NDN network.
 * @param {string | undefined} testConnection
 */
export async function connect(testConnection) {
  for (const [i, attempt] of [
    async () => {
      const pref = window.localStorage.getItem("router");
      if (!pref) {
        throw new Error("preferred router not set");
      }
      const { face } = await connectToRouter(pref, {
        H3Transport,
        testConnection: false,
      });
      return [face];
    },
    () => connectToNetwork({
      H3Transport,
      preferH3: true,
      fallback: ["wundngw.arl.wustl.edu", "ndn-testbed.ewi.tudelft.nl"],
      testConnection,
      testConnectionTimeout: 6000,
    }),
  ].entries()) {
    try {
      const [face] = await attempt();
      remote = face.toString();
      console.log("connected to", remote);
      return;
    } catch (err) {
      console.warn(`connect attempt ${i}`, err);
    }
  }
  throw new Error("unable to connect");
}
