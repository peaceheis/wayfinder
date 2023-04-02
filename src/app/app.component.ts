import { Component } from '@angular/core';

import {Graph} from 'graphlib';
import * as graphlib from "graphlib";

async function sleep(msec: number) {
  return new Promise(resolve => setTimeout(resolve, msec));
}

function graphInit() {
  let g = new Graph({directed: true});
  initializeNodes(g, [
    "1233", "1235", "1ST_F", "1229", "1227", "1223", "1223",
    "1219", "12101211C", "1220", "1221", "G"
    ])

  addLeftCornerEdge(g, "1235", "1233");
  addRightEdge(g, "1233", "1ST_F");
  addDownStairsEdge(g, "1ST_F", "G");
  addLeftEdge(g, "1ST_F", "1229");
  addLeftEdge(g, "1229", "1227");
  addLeftEdge(g, "1227", "1223");
  addLeftEdge(g, "1223", "12101211C");
  addLeftCornerEdge(g, "12101211C", "1220");


  return g;
}

function initializeNodes(g: Graph, nodes: string[]) {
  for (let node of nodes) {
    g.setNode(node);
  }
}

function addLeftEdge(g: Graph, v: string, w: string) {
  g.setEdge(v, w, "L");
  g.setEdge(w, v, "R");
}

function addRightEdge(g: Graph, v: string, w: string) {
  g.setEdge(v, w, "R");
  g.setEdge(w, v, "L");
}

function addLeftCornerEdge(g: Graph, v: string, w: string) {
  g.setEdge(v, w, "CL");
  g.setEdge(w, v, "CR");
}

function addRightCornerEdge(g: Graph, v: string, w: string) {
  g.setEdge(v, w, "CR");
  g.setEdge(w, v, "CL");
}

function addDownStairsEdge(g: Graph, v: string, w: string) {
  g.setEdge(v, w, "SD");
  g.setEdge(w, v, "SU");
}

function addUpStairsEdge(g: Graph, v: string, w: string) {
  g.setEdge(v, w, "SU");
  g.setEdge(w, v, "SD");
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'wayfinder';

  async ngOnInit() {
    let g: Graph = graphInit();

    // initial welcome
    for (let i = 1; i <= 2; i++) {
      await sleep(500);
      let element = document.getElementById(String(i));
      // @ts-ignore
      element.style.opacity = "1";
      await sleep(500);
    }

    await sleep(2000); // give 2s reading time

    //remove elements on screen
    for (let i = 2; i >= 1; i--) {
      await sleep(500);
      let element = document.getElementById(String(i))
      // @ts-ignore
      element.style.opacity = "0";
      await sleep(500);
      // @ts-ignore
      element.remove();
    }


    // start finding where
    (document.getElementById("6") as HTMLButtonElement).onclick = function () {getStart(g);}
    for (let i = 3; i <= 6; i++) {
      if (i == 5) {
        (document.getElementById("5") as HTMLInputElement).disabled = false;
      } else if (i == 6) {
        (document.getElementById("6") as HTMLButtonElement).disabled = false;
      }

      await sleep(500);
      let element = document.getElementById(String(i));

      // @ts-ignore
      element.style.opacity = "1";
      await sleep(500);

      // look at getStart to see where code execution goes from here!
    }
  }
}

async function getStart(g: Graph) {
  await sleep(500);
  let val = (document.getElementById("5") as HTMLInputElement).value;

  if (g.hasNode(String(val))) {
    // initialize next options
    let firstThingsFirstElem = (document.getElementById("3") as HTMLElement);
    firstThingsFirstElem.style.opacity = "0"
    let tryAgainElem = (document.getElementById("7") as HTMLElement);
    tryAgainElem.style.opacity = "0"
    let inputElem = (document.getElementById("5") as HTMLInputElement);
    inputElem.disabled = true;

    await sleep(500);
    tryAgainElem.remove();
    firstThingsFirstElem.remove();

    for (let i = 8; i <= 10; i++) {
      await sleep(250);
      (document.getElementById(String(i)) as HTMLInputElement).disabled = true;
      let element = document.getElementById(String(i));
      // @ts-ignore
      element.style.opacity = "1";
      await sleep(250);

      if(i == 9 || i == 10) {
        (element as HTMLInputElement).disabled = false;
      }
    }
    (document.getElementById("10") as HTMLButtonElement).onclick = function () {getDestination(g);}
  } else {
    (document.getElementById("7") as HTMLElement).style.opacity = String(1);
    await sleep(500);
  }
}

async function getDestination(g: Graph) {
  let val = (document.getElementById("9") as HTMLInputElement).value;
  if (g.hasNode(String(val))) {
    let tryAgainElem = (document.getElementById("11") as HTMLElement);
    tryAgainElem.style.opacity = "0";
    let inputElem = (document.getElementById("9") as HTMLInputElement);
    inputElem.disabled = true;

    await sleep(500);
    tryAgainElem.remove();
    let source = (document.getElementById("5") as HTMLInputElement).value;
    let dest = (document.getElementById("9") as HTMLInputElement).value;
    console.log("source " + source + " dest: " + dest);

    for (let i = 10; i >= 4; i--) {
      if (i == 7) {
        continue;
      }
      let elem = (document.getElementById(String(i)) as HTMLElement);
      elem.style.opacity = "0";
      await sleep(500);
      elem.remove();
    }
    (document.getElementById("12") as HTMLElement).style.opacity = String(1);
    await sleep(500);

    await generatePath(g, source, dest);


  } else {
    (document.getElementById("11") as HTMLElement).style.opacity = String(1);
    await sleep(500);
  }

}

async function generatePath(g: Graph, source: string, dest: string) {
  let connectionMap: object = graphlib.alg.dijkstra(g, source);
  // @ts-ignore
  let prevVertex = connectionMap[dest]["predecessor"];
  // @ts-ignore
  let distance = connectionMap[dest]["distance"] + 1
  // @ts-ignore
  let vertices: string[] = Array(distance);
  vertices[0] = source;
  // @ts-ignore
  vertices[distance - 1] = dest;
  let i = distance - 1;
  while (prevVertex != source) {
    // @ts-ignore
    prevVertex = connectionMap[prevVertex]["predecessor"];
    vertices[i] = prevVertex;
    i--;
  }
  console.log(vertices);

  // create edges from vertices & get instructions
  let instructions = Array();
  let inHallway = false;
  let start = true;
  for (let i = 0; i <= vertices.length - 1; i++) {
    if (start) {
      instructions.push(await evalFirstEdge(vertices[1], g.edge(source, vertices[1])));
      start = false;
    }
    else if (i == vertices.length - 1) {
      if (inHallway) {
        instructions.push("go down the hallway.");
        inHallway = false;
      }
      instructions.push(await evalLastEdge(vertices[i], g.edge(vertices[i], vertices[i+1])));
    } else {
      let instruction = await evalEdge(g.edge(vertices[i], vertices[i + 1]));
      console.log(instruction, g.edge(vertices[i], vertices[i + 1]));
      if (instruction == "") {
        inHallway = true;
      } else {
        if (inHallway) {
          instructions.push("go down the hallway.");
          inHallway = false;
        }
        instructions.push(instruction);
      }
    }
  }
  console.log(instructions);

  // construct list
  let output = document.createElement("ul");
  let j = 0;
  for (let instruction of instructions) {
    let li = document.createElement("li");
    li.classList.add("fadesin");
    li.id = "li".concat(String(j));
    li.appendChild(document.createTextNode(instruction));
    output.appendChild(li);
    j++;
  }
  (document.getElementById("splash") as HTMLDivElement).appendChild(output);


  for (let k = 0; k < j; k++) {
    await sleep(250);
    (document.getElementById("li".concat(String(k))) as HTMLElement).style.opacity = "1";
    await sleep(250);
  }
}

async function evalFirstEdge(w: string, e: string) {
  return (await evalEdge(e) == "") ? "start walking past " + w  : (await evalEdge(e));
}

async function evalEdge(e: string) {
  switch(e) {
    case "CU":
      return "make a U-turn around the corner.";
    case "CR":
      return "make a right around the corner.";
    case "CL":
      return "make a left around the corner.";
    case "T":
      return "go through the doors."
    case "SD":
      return "go down the stairs."
    case "SU":
      return "go up the stairs."
    default:
      return "";
  }
}

async function evalLastEdge(w: string, e: string) {
  switch(e) {
    case "R":
      return "your destination will be on your right."
    case "L":
      return "your destination will be on your left."
    case "CR":
      return "your destination will be past a right turn around the corner.";
    case "CL":
      return "your destination will be past a left turn around the corner.";
    default:
      return "your destination will be ahead of you."
  }
}

