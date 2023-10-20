// import * as THREE from "three";
// import * as d3 from "d3";
// import * as util from "./util";

// class Perimeter extends THREE.Group {
//   constructor(config) {
//     super();

//     this.timescale = 3;
//     this.clock = new THREE.Clock();
//     this.centroidCoords = config.centroid.coordinates;
//     this.date = new Date(config.perimeter_date);
//     this.acres = config.acres;
//     this.perimCoords = config.perimeter.coordinates;

//     // rotation, thickness, shadows, material
//     this.rotation.x = util.degToRad(-80);
//     this.thickness = 0.1;
//     this.highlightColor = 0x00ff00;
//     this.material = new THREE.MeshToonMaterial({
//       color: 0x00ff00,
//     });

//     // animation variables
//     this.moveTowardsValue = 0.1;

//     this.mixer = new THREE.AnimationMixer(this);

//     this.updateFocusAction();
//   }

//   init() {
//     this._createMeshes(this.perimCoords);
//   }

//   setPowerData(powerData) {
//     this.powerData = powerData;
//   }

//   focusPerimeter(objectColor) {
//     for (const child of this.children) {
//       child.material.color = new THREE.Color(objectColor);
//     }

//     this.focusAction.reset();
//     this.focusAction.timeScale = this.timescale;
//     this.focusAction.setLoop(THREE.LoopOnce);
//     this.focusAction.clampWhenFinished = true;
//     this.focusAction.play();
//   }

//   defocusPerimeter(objectColor) {
//     for (const child of this.children) {
//       child.material.color = new THREE.Color(objectColor);
//     }

//     this.focusAction.paused = false;
//     this.focusAction.timeScale = -this.timescale;
//     this.focusAction.setLoop(THREE.LoopOnce);
//     this.focusAction.play();
//   }

//   selectedColor(objectColor){
//     for (const child of this.children) {
//       child.material.color = new THREE.Color(objectColor);
//     }
//   }

//   animate() {
//     let delta = this.clock.getDelta();
//     this.mixer.update(delta);
//   }

//   // overwrites Group's raycast
//   _raycast(raycaster, intersects) {
//     for (const child of this.children) {
//       let i = [];
//       child._raycast(raycaster, i);

//       if (i.length > 0) {
//         intersects.push(this);
//         return;
//       }
//     }
//   }

//   // creates meshes from each of the polygons given, then adds
//   // these meshes to the group which this class extends
//   _createMeshes(polygons) {
//     for (const polygon of polygons) {
//       var pts = this._getLocPointsFromPoly(polygon[0]);
//       var shape = new THREE.Shape(pts);
//       var shapeGeom = new THREE.ShapeGeometry(shape);
//       var mat = new THREE.MeshLambertMaterial({
//         color: 0x00ff00,
//         opacity: 0,
//         transparent: false,
//       });
//       var mesh = new THREE.Mesh(shapeGeom, mat);
//       mesh.receiveShadow = true;
//       mesh.castShadow = true;

//       this.add(mesh);
//     }
//   }

//   // takes a polygon, translates it into the origin and returns an array of
//   // Vector2 points for each point in the translated array
//   _getLocPointsFromPoly(polygon) {
//     var pts = [];

//     // console.log("centroid coords: ", this.centroidCoords);
//     // transform to origin
//     let originPolygon = d3.map(polygon, (d) => {
//       return [d[0] - this.centroidCoords[0], d[1] - this.centroidCoords[1]];
//     });

//     // add x and y of a point to points array
//     for (const pt of originPolygon) {
//       pts.push(new THREE.Vector2(pt[0], pt[1]));
//     }

//     return pts;
//   }

//   updateFocusAction() {
//     // define axis, initial and final quarternion
//     let xAxis = new THREE.Vector3(1, 0, 0);
//     let qInitial = new THREE.Quaternion().setFromAxisAngle(
//       xAxis,
//       this.rotation.x
//     );
//     let qFinal = new THREE.Quaternion().setFromAxisAngle(xAxis, 0);

//     // define keyframes
//     let rotKF = new THREE.QuaternionKeyframeTrack(
//       ".quaternion",
//       [0, 1],
//       [
//         qInitial.x,
//         qInitial.y,
//         qInitial.z,
//         qInitial.w,
//         qFinal.x,
//         qFinal.y,
//         qFinal.z,
//         qFinal.w,
//       ]
//     );
    
//     this.focusClip = new THREE.AnimationClip("Action", 1, [
//       rotKF
//     ]);
//     this.focusAction = this.mixer.clipAction(this.focusClip);
//   }

//   _generateTexture() {
//     let perimPowers = this.powerData;

//     let canvas = document.createElement("canvas");
//     canvas.width = 256;
//     canvas.height = 256;

//     // scale perim coords between canvas width and height
//     let coordExtent = util.findCoordinateExtent(perimPowers);
//     let minLong = coordExtent[0];
//     let maxLong = coordExtent[1];
//     let minLat = coordExtent[2];
//     let maxLat = coordExtent[3];
//     perimPowers.forEach(function(perimPower, i) {
//       perimPower.longitude = Math.floor(
//         ((perimPower.longitude - minLong) / (maxLong - minLong)) * canvas.width
//       );
//       perimPower.latitude = Math.floor(
//         ((perimPower.latitude - minLat) / (maxLat - minLat)) * canvas.height
//       );
//       perimPowers[i] = perimPower;
//     });

//     let ctx = canvas.getContext("2d");
//     ctx.fillStyle = "black";
//     ctx.fillRect(0, 0, 256, 256);

//     for (let i = 0; i < 100; i++) {
//       var x = Math.floor(Math.random() * 255);
//       var y = Math.floor(Math.random() * 255);
//       var radius = 50;
//       var grd = ctx.createRadialGradient(x, y, 1, x, y, radius);
//       var h8 = Math.floor(Math.random() * 255);
//       grd.addColorStop(0, "rgb(" + h8 + "," + h8 + "," + h8 + ")");
//       grd.addColorStop(1, "transparent");
//       ctx.fillStyle = grd;
//       ctx.fillRect(0, 0, 256, 256);
//     }

//     return new THREE.CanvasTexture(canvas);
//   }
// }
// export default Perimeter;
