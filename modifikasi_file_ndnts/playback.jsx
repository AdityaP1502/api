import { el, setChildren } from "redom";

import { sendBeacon, data } from "./connect.js";
import { Player } from "./player.jsx";
import { StatDisplay } from "./stat-display.jsx";

const RE_DESCRIPTION = /^([^<]*)<([^>]+)>(.*)$/;

/** Render NDN player and statistics display. */
export class Playback {
  constructor() {
    <div this="el" class="pure-g">
      <div class="pure-u-1 pure-u-lg-3-4">
        <Player this="$player"/>
      </div>
      <div class="pure-u-1 pure-u-lg-1-4">
        <div class="sidebar">
          <h2 this="$title"></h2>
          <p this="$date"></p>
          <p this="$description"></p>
          <p this="$fallbackLink" hidden></p>
          <StatDisplay this="$stat"/>
        </div>
      </div>
    </div>;
  }

  onmount() {
    this.nStats = 0;
    this.prevDecodedFrames = 0;
    this.timer = setInterval(() => {
      const stat = this.$player.getStat();
      const {playerStats} = stat;
      const {
        height,
        decodedFrames,
        droppedFrames,
        estimatedBandwidth,
        loadLatency,
        playTime,
        pauseTime,
        bufferingTime,
      } = playerStats;
      const data = {
        a: "P",
        r: height,
        fd: decodedFrames,
        fr: droppedFrames,
        be: Math.round(estimatedBandwidth),
        tl: Math.round(loadLatency * 1000),
        tp: Math.round(playTime * 1000),
        tu: Math.round(pauseTime * 1000),
        tb: Math.round(bufferingTime * 1000),
      };
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

      this.$stat.update(stat);
      if (!!this.name && (++this.nStats) % 25 === 0) {
        this.sendStatBeason(stat);
      }
    }, 200);
  }

  onunmount() {
    clearInterval(this.timer);
  }

  /** @param {import("./content.js").Entry} entry */
  update(entry) {
    const { title, name, description, date, fallback } = entry;
    if (!Player.supported) {
      location.replace(`#fallback=${name}`);
      return;
    }
    this.name = name;
    this.$title.textContent = title;
    this.$date.textContent = `${date ? new Date(date).toDateString() : ""}`;
    setChildren(this.$description, Array.from((function*(s) {
      while (s) {
        const m = RE_DESCRIPTION.exec(s);
        if (!m) {
          yield <span>{s}</span>;
          return;
        }
        const [, text, link, rest] = m;
        yield <span>{text}</span>;
        try {
          const u = new URL(link);
          yield <a href={link} target="_blank" rel="noopener">{u.hostname}</a>;
        } catch {
          yield `<${link}>`;
        }
        s = rest;
      }
    })(description)));
    this.$player.update(entry);
    this.$fallbackLink.hidden = !fallback;
    setChildren(this.$fallbackLink, [
      <a href={`#fallback=${name}`}>watch on fallback site</a>,
    ]);
  }

  sendStatBeason({ playerStats }) {
    const {
      height,
      decodedFrames,
      droppedFrames,
      estimatedBandwidth,
      loadLatency,
      playTime,
      pauseTime,
      bufferingTime,
    } = playerStats;
    if (decodedFrames === this.prevDecodedFrames) {
      return;
    }
    this.prevDecodedFrames = decodedFrames;
    // const Http = new XMLHttpRequest();
    // const url = "http://localhost:5000/data"; 
    // Http.open('POST', url);
    // Http.setRequestHeader('Content-type', 'application/json');
    
    // let data = {
    //   r: height,
    //   fd: decodedFrames,
    //   fr: droppedFrames,
    //   be: Math.round(estimatedBandwidth),
    //   tl: Math.round(loadLatency * 1000),
    //   tp: Math.round(playTime * 1000),
    //   tu: Math.round(pauseTime * 1000),
    //   tb: Math.round(bufferingTime * 1000),
    // };

    // Http.send(JSON.stringify(data));

    // Http.onreadystatechange = (e) => {
    //   console.log(data);
    //   console.log(Http.responseText);
    // }
    const q = {
      a: "P",
      n: this.name,
      on: true,
      r: height,
      fd: decodedFrames,
      fr: droppedFrames,
      be: Math.round(estimatedBandwidth),
      tl: Math.round(loadLatency * 1000),
      tp: Math.round(playTime * 1000),
      tu: Math.round(pauseTime * 1000),
      tb: Math.round(bufferingTime * 1000),
    };
    sendBeacon(q);
  }
}
