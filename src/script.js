import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as CANNON from 'cannon-es'
import CannonDebugger from 'cannon-es-debugger'
import { Vec3 } from 'cannon-es'
// import { threeToCannon, ShapeType } from 'three-to-cannon';

// console.log(threeToCannon)



// let goal, follow

// let temp = new THREE.Vector3();
// let dir = new THREE.Vector3();
// let a = new THREE.Vector3();
// let b = new THREE.Vector3();
// let coronaSafetyDistance = 16.0;

/**
 * Base
 */

// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Physics
 */

// World

const world = new CANNON.World()
//world.broadphase = new CANNON.SAPBroadphase(world)
world.gravity.set(0, -9.82, 0)


// Cannon ground

const groundBody = new CANNON.Body({
    type: CANNON.Body.STATIC,
    shape: new CANNON.Plane()
    // shape: new CANNON.Box(new CANNON.Vec3(120, 120, 0.01))
})

groundBody.quaternion.setFromEuler(-Math.PI * 0.5, 0, 0 )

world.addBody(groundBody)

// Default material

const defaultMaterial = new CANNON.Material('ground')

const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    {
        friction: 0.4,
        restitution: 0.0
    }
)
world.defaultContactMaterial = defaultContactMaterial

// Cannon debugger

const cannonDebugger = new CannonDebugger(scene, world)


let debugObject = {
    boxX: 1.38/2,
    boxY: 1.35/2,
    boxZ: 3.38/2,
    chassisPositionX: 0.,
    chassisPositionY: -0.9,
    chassisPositionZ: -0.76,
    wheel1X: 0.75
}

// let shapeDebug = {
//     shape: new CANNON.Box(new CANNON.Vec3(1.38/2, 1.35/2, 3.38/2)),
//     position1: new CANNON.Vec3(0.7548, 1.35/2 - 0.4346,1.8577)
// }

// gui.add(debugObject, "boxX", 0.5, 4, 0.1).name("boxX").onChange(
//     () => {
//         shapeDebug.shape.halfExtents.x = debugObject.boxX
//     }
// )

// gui.add(debugObject, "boxY", 0.5, 4, 0.1).name("boxY").onChange(
//     () => {
//         shapeDebug.shape.halfExtents.y = debugObject.boxY
//     }
// )

// gui.add(debugObject, "boxZ", 0.5, 4, 0.1).name("boxZ").onChange(
//     () => {
//         shapeDebug.shape.halfExtents.z = debugObject.boxZ
//     }
// )

// gui.add(debugObject, "chassisPositionX", -20, 20, 0.001).name("chassisPositionX")
// gui.add(debugObject, "chassisPositionY", -20, 20, 0.001).name("chassisPositionY")
// gui.add(debugObject, "chassisPositionZ", -20, 20, 0.001).name("chassisPositionZ")

// gui.add(debugObject, "wheel1X", 0.5, 4, 0.1).name("position1X").onChange(
//     () => {
//         vehicle.wheelBodies[0].initPosition.x = debugObject.wheel1X
//     }
// )

// Cannon Car

const carBody = new CANNON.Body({
    mass: 4,
    shape: new CANNON.Box(new CANNON.Vec3(1.38*0.5, 1.348*0.5, 3.376*0.5)),
    position: new CANNON.Vec3(0,6,0)
})

//carBody.quaternion.setFromEuler(0, -Math.PI , 0 )

// Create the vehicle
const vehicle = new CANNON.RigidVehicle({
    chassisBody: carBody
})

//vehicle.addToWorld(world)

// // Wheels

const mass = 1
const axisWidth = 1.88
const axisWidthFront = 1.326
const axisWidthRear = 1.333

const rearRadiusTop = 0.44
const rearRadiusBottom = 0.44
const rearHeight = 0.26
const rearNumSegments = 32
const rearWheelShape = new CANNON.Cylinder(rearRadiusTop, rearRadiusBottom, rearHeight, rearNumSegments)
const quaternion = new CANNON.Quaternion().setFromEuler(0, 0, -Math.PI / 2)

const frontRadiusTop = 0.395
const frontRadiusBottom = 0.395
const frontHeight = 0.14
const frontNumSegments = 32
const frontWheelShape = new CANNON.Cylinder(frontRadiusTop, frontRadiusBottom, frontHeight, frontNumSegments)

const wheelShape = new CANNON.Sphere(0.5)

const wheelMaterial = new CANNON.Material('wheel')
const down = new CANNON.Vec3(0, -1, 0)


const wheelBody1 = new CANNON.Body({ mass, material: wheelMaterial })
wheelBody1.addShape(rearWheelShape, new CANNON.Vec3(), quaternion)

//wheelBody1.addShape(wheelShape)

//  shape: new CANNON.Box(new CANNON.Vec3(1.69, 0.69, 0.675))
let offsetZ = -0.12
let offsetFront = -0.1

// rear right wheel 0.6277589797973633, y: -1.027273178100586, z: -0.5173605680465698
// rear left wheel -0.67516028881073, y: -1.030426025390625, z: -0.5171953439712524
// front right wheel 0.7081910967826843, y: 1.3602045774459839, z: -0.5597286224365234
// front left wheel -0.7411616444587708, y: 1.3820507526397705, z: -0.5590680837631226

// body position 0.8819676637649536 y: 95.20069885253906 z: 82.88011169433594

vehicle.addWheel({
    body: wheelBody1,
    //position: new CANNON.Vec3(-0.675, -0.5 , 1.2 + offsetZ),
    position: new CANNON.Vec3(0.675, -0.517, 1.030),
    axis: new CANNON.Vec3(-1, 0, 0),
    direction: down
})

// console.log(vehicle)

const wheelBody2 = new CANNON.Body({ mass, material: wheelMaterial })
wheelBody2.addShape(rearWheelShape, new CANNON.Vec3(), quaternion)
vehicle.addWheel({
    body: wheelBody2,
    position: new CANNON.Vec3(-0.628, -0.517, 1.027),
    //position: new CANNON.Vec3(0.675, -0.5, 1.2 + offsetZ),
    axis: new CANNON.Vec3(1, 0, 0),
    direction: down
})

const wheelBody3 = new CANNON.Body({ mass, material: wheelMaterial })
wheelBody3.addShape(frontWheelShape, new CANNON.Vec3(), quaternion)
vehicle.addWheel({
    body: wheelBody3,
    //position: new CANNON.Vec3(-0.675, -0.5, -1.2 + offsetFront),
    position: new CANNON.Vec3(-0.741, -0.56, -1.36),
    axis: new CANNON.Vec3(-1, 0, 0),
    direction: down
})


const wheelBody4 = new CANNON.Body({ mass, material: wheelMaterial })
wheelBody4.addShape(frontWheelShape, new CANNON.Vec3(), quaternion)
vehicle.addWheel({
    body: wheelBody4,
    position: new CANNON.Vec3(0.708, -0.56, -1.36),
    axis: new CANNON.Vec3(1, 0, 0),
    direction: down
})

// vehicle.wheelBodies.forEach((wheelBody) => {
//     wheelBody.angularDamping = .4
// })



vehicle.addToWorld(world)



/**
 * GLTF Model
 */

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

let test
let chassisMesh;
let chassisBlue;
let rearWheelMesh1;
let frontWheelMesh1;

let rearWheelMesh2;
let frontWheelMesh2;

const axesHelper = new THREE.AxesHelper(8);
scene.add(axesHelper);
axesHelper.setColors(new THREE.Color('red'), new THREE.Color('green'), new THREE.Color('blue'))

let engine;

gltfLoader.load(
    '/models/vintage_racing_car/vintage_racing_car_light.glb',
    (gltf) => {
        test = gltf.scene

        console.log("Model")
        console.log(test)

        console.log("Children")
        console.log(test.children)

        console.log("Traverse")
        console.log("Traverse")
        console.log("Traverse")

        test.traverse(function (node) {

            

            // console.log(node.name)

            // console.log(node.getWorldPosition(new THREE.Vector3()))

            

            if (node.isMesh) {
                
                console.log(node.name)

                //console.log(node.getWorldPosition(new THREE.Vector3()))

                console.log(node.position)

                console.log(node.parent)

                console.log(node.parent.position)


            }
        });

        console.log("Out of traverse")
        console.log("Out of traverse")
        console.log("Out of traverse")

        chassisMesh = test.getObjectByName("Body_blue_0", true)

        console.log("Body_blue_0")
        console.log(chassisMesh.getWorldPosition(new THREE.Vector3()))



        
        //chassisMesh.castShadow = true

        chassisMesh.position.copy(carBody.position)
        chassisMesh.quaternion.copy(carBody.quaternion)


        // renderer.render(scene, camera)

        rearWheelMesh1 = test.getObjectByName("rear_right_wheel_rear_wheel_0")
        rearWheelMesh2 = test.getObjectByName("rear_left_wheel_rear_wheel_0")
        frontWheelMesh1 = test.getObjectByName("front_right_wheel_front_wheel_0")
        frontWheelMesh2 = test.getObjectByName("front_left_wheel_front_wheel_0")

        // console.log(test.matrix)
        // console.log(test.matrixWorld)


        // console.log(rearWheelMesh1.matrix)
        // console.log(rearWheelMesh1.matrixWorld)
        



       



        let part = test.getObjectByName("engine_engine001_0", true)

        console.log("engine_engine001_0")
        console.log(part.getWorldPosition(new THREE.Vector3()))
        

        part.position.set(0.014, 0.952, -0.215)

        // console.log("Engine Mesh World Position after setting position")
        // console.log(part.getWorldPosition(new THREE.Vector3()))
        // console.log(part.worldToLocal(new THREE.Vector3()))

        
        
        // engineModel.getWorldPosition(tempVector3)
        // newEngineModel.position.copy(tempVector3)

        //part.position.set(0.014,10.952,-0.215)

        // part.updateMatrix()

        // part.getWorldPosition(new THREE.Vector3())

        chassisMesh.add(part)

       //chassisMesh.updateMatrixWorld()

        let part2 = test.getObjectByName("engine_part_engine001_0", true)

        part2.position.set(0.014+0.009, 0.952+0.353, -0.215-0.093)


        

        

        // chassisMesh.getWorldPosition(tempVector3)
        // part2.position.copy(tempVector3)
        //part2.position.copy(part2.getWorldPosition(new THREE.Vector3()))

        // part2.position.set(-0.166+0.014,0.360+0.952,0.048-0.215)

        chassisMesh.add(part2)

        let part3 = test.getObjectByName("engine_part002_engine001_0", true)

        part3.position.set(0.014+0.009, 0.952+0.435, -0.215+0.131)

        // chassisMesh.getWorldPosition(tempVector3)
        // part3.position.copy(tempVector3)

        // part3.position.set(0.009+0.014,0.435+0.952,0.131-0.215)

       

        chassisMesh.add(part3)

        //console.log(chassisMesh.isMesh)

        

        

        // console.log(chassisMesh.matrixWorld)
        // console.log(chassisMesh.matrix)


        // engine = test.getObjectByName("engine_part_engine001_0", true)

        // let target = new THREE.Vector3(); // create once an reuse it

        // test.getWorldPosition(engine.position)

        // console.log("YEAH")
        // console.log(engine.getWorldPosition( target ));
        // engine.position.set(target.x, target.y, target.z)
        // console.log(rearWheelMesh1.getWorldPosition( target ));
        // console.log(rearWheelMesh2.getWorldPosition( target ));
        // console.log(frontWheelMesh1.getWorldPosition( target ));
        // console.log(frontWheelMesh2.getWorldPosition( target ));
        // console.log(chassisMesh.getWorldPosition( target ));




        // console.log("YEAH")


        // engine.add(test.getObjectByName("engine_part001_engine001_0", true))
        // engine.add(test.getObjectByName("engine_part002_engine001_0", true))
        // engine.add(test.getObjectByName("engine_engine001_0", true))


        // // engine.position.z -= 0.7
        // scene.add(engine)


        // console.log("Front Wheel Mesh:")
        // console.log(frontWheelMesh1.geometry.get)
        //console.log(frontWheelMesh1)

        // console.log(frontWheelMesh1.getWorldPosition(new THREE.Vector3()))
        // console.log(frontWheelMesh2.getWorldPosition(new THREE.Vector3()))
        // console.log(rearWheelMesh1.getWorldPosition(new THREE.Vector3()))
        // console.log(rearWheelMesh2.getWorldPosition(new THREE.Vector3()))

        scene.add(frontWheelMesh1)
        scene.add(frontWheelMesh2)
        scene.add(rearWheelMesh1)
        scene.add(rearWheelMesh2)

        //console.log(chassisMesh)

        scene.add(chassisMesh)


        


        

        //console.log(part2.getWorldPosition(new THREE.Vector3()))
        


        // const box = new THREE.BoxHelper(chassisMesh, 0xffff00);
        //scene.add(box);

        // const box1 = new THREE.BoxHelper(rearWheelMesh1, 0xffff00);
        //scene.add(box1);

        // const box2 = new THREE.BoxHelper(rearWheelMesh2, 0xffff00);
        //scene.add(box2);

        // const box3 = new THREE.BoxHelper(frontWheelMesh1, 0xffff00);
        //scene.add(box3);

        // console.log(box)
        // console.log(box1.position)
        // console.log(box2.position)

        const bbox = new THREE.Box3().setFromObject(chassisMesh)

        console.log(bbox.getSize(new THREE.Vector3()))
        //console.log(bbox.getCenter(new THREE.Vector3()))
       

        // const bbox1 = new THREE.Box3().setFromObject(rearWheelMesh1)

        //console.log(bbox1.getSize(new THREE.Vector3()))
        //console.log(bbox1.getCenter(new THREE.Vector3()))

        // const bbox2 = new THREE.Box3().setFromObject(rearWheelMesh2)

        //console.log(bbox2.getSize(new THREE.Vector3()))
        //console.log(bbox2.getCenter(new THREE.Vector3()))

        // const bbox3 = new THREE.Box3().setFromObject(frontWheelMesh1)

        //console.log(bbox3.getSize(new THREE.Vector3()))
        //console.log(bbox3.getCenter(new THREE.Vector3()))

        // const bbox4 = new THREE.Box3().setFromObject(frontWheelMesh2)

        //console.log(bbox4.getSize(new THREE.Vector3()))
        //console.log(bbox4.getCenter(new THREE.Vector3()))

       

        tick()
    }
)

// let engine;

// gltfLoader.load(
//     '/models/engine/scene.glb',
//     (gltf) => {
//         engine = gltf.scene

//         scene.add(engine)

//         console.log("***********")

//         console.log(engine.getWorldPosition(new THREE.Vector3()))
//         console.log(engine.localToWorld(new THREE.Vector3()))

//         console.log("***********")
//     }
// )


/**
 * Experimental three.js car
 */

// const carGeometry = new THREE.BoxGeometry(4, 1.5, 10);
// const carMaterial = new THREE.MeshBasicMaterial({ color: "white" });
// carMaterial.wireframe = true
// const chassisMesh = new THREE.Mesh(carGeometry, carMaterial);
// scene.add(chassisMesh);

// //const rearWheelGeometry1 = new THREE.SphereGeometry(1.5) 
// const rearWheelGeometry1 = new THREE.CylinderGeometry(rearRadiusTop, rearRadiusBottom, rearHeight, rearNumSegments, rearNumSegments)
// const rearWheelMesh1 = new THREE.Mesh(rearWheelGeometry1, carMaterial)
// scene.add(rearWheelMesh1)

// //const rearWheelGeometry2 = new THREE.SphereGeometry(1.5)
// const rearWheelGeometry2 = new THREE.CylinderGeometry(rearRadiusTop, rearRadiusBottom, rearHeight, rearNumSegments, rearNumSegments)
// const rearWheelMesh2 = new THREE.Mesh(rearWheelGeometry2, carMaterial)
// scene.add(rearWheelMesh2)

// //const frontWheelGeometry1 = new THREE.SphereGeometry(1.5)
// const frontWheelGeometry1 = new THREE.CylinderGeometry(frontRadiusTop, frontRadiusBottom, frontHeight, frontNumSegments, frontNumSegments)
// const frontWheelMesh1 = new THREE.Mesh(frontWheelGeometry1, carMaterial)
// scene.add(frontWheelMesh1)

// //const frontWheelGeometry2 = new THREE.SphereGeometry(1.5)
// const frontWheelGeometry2 = new THREE.CylinderGeometry(frontRadiusTop, frontRadiusBottom, frontHeight, frontNumSegments, frontNumSegments)
// const frontWheelMesh2 = new THREE.Mesh(frontWheelGeometry2, carMaterial)
// scene.add(frontWheelMesh2)

/**
 * Floor 
 */

//const textureLoader = new THREE.TextureLoader()

// const occlusionTexture = textureLoader.load("/textures/Stylized_Sand_001_SD/Stylized_Sand_001_ambientOcclusion.jpg")
// const baseTexture = textureLoader.load("/textures/Stylized_Sand_001_SD/Stylized_Sand_001_basecolor.jpg")
// const heightTexture = textureLoader.load("/textures/Stylized_Sand_001_SD/Stylized_Sand_001_height.png")
// const normalTexture = textureLoader.load("/textures/Stylized_Sand_001_SD/Stylized_Sand_001_normal.jpg")
// const roughnessTexture = textureLoader.load("/textures/Stylized_Sand_001_SD/Stylized_Sand_001_roughness.jpg")

/**
 * Floor
 */

// let plane = new THREE.PlaneGeometry(240, 240, 32, 32)


// const floor = new THREE.Mesh(
//     plane,
//     new THREE.MeshStandardMaterial({
//         color: '#444444',
//         metalness: 0,
//         roughness: 0.8,
//         // map : baseTexture,
//         // aoMap : occlusionTexture,
//         // aoMapIntensity : 0.9,
//         // side : THREE.DoubleSide,
//         // normalMap : normalTexture,
//         // displacementMap : heightTexture,
//         // displacementScale : 0.1,
//         // roughnessMap : roughnessTexture
//     })
// )
// floor.receiveShadow = true
// floor.rotation.x = - Math.PI * 0.5
// scene.add(floor)


//floor.geometry.setAttribute('uv2', new THREE.BufferAttribute(floor.geometry.attributes.uv.array, 2))

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(- 5, 5, 0)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 10000)
camera.position.set(0, 4, 0)
camera.lookAt(scene.position);
//goal = new THREE.Object3D();
//follow = new THREE.Object3D();
//follow.position.z = -coronaSafetyDistance;
//chassisMesh.add(follow);

//goal.add(camera);
//scene.add(camera)

// const helper = new THREE.CameraHelper( camera );
// scene.add( helper );

// Orbit controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Simple animation

    // rearWheelMesh1.rotation.x = deltaTime * 100
    // rearWheelMesh2.rotation.x = deltaTime * 100

    //frontWheelMesh1.rotation.x = -deltaTime * 40
    //frontWheelMesh2.rotation.x = -deltaTime * 40

    

    

    // GLTF car

    // model.position.copy(chassisBody.position)
    // model.quaternion.copy(chassisBody.quaternion)
    // model.position.y = model.position.y + debugPosition.amount

    // wheel1.position.copy(wheelBody1.position)
    // wheel1.quaternion.copy(wheelBody1.quaternion)
    // wheel1.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2)

    // wheel4.position.copy(wheelBody2.position)
    // wheel4.quaternion.copy(wheelBody2.quaternion)
    // wheel4.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2)

    // wheel2.position.copy(wheelBody3.position)
    // wheel2.quaternion.copy(wheelBody3.quaternion)
    // wheel2.rotateOnAxis(new THREE.Vector3(0, 0, 1), -Math.PI / 2)


    // wheel5.position.copy(wheelBody4.position)
    // wheel5.quaternion.copy(wheelBody4.quaternion)
    // wheel5.rotateOnAxis(new THREE.Vector3(0, 0, 1), -Math.PI / 2)


    

    // console.log(chassisMesh.position)
    // console.log(carBody.position)

    // Experimental three.js car

    //chassisMesh.position.copy(carBody.position)
    if(chassisMesh){

    chassisMesh.position.copy(carBody.position)
    chassisMesh.quaternion.copy(carBody.quaternion)

    chassisMesh.rotateX(-Math.PI/2)

    
    }

    

    // if(engine){
    // engine.position.copy(carBody.position)
    // engine.quaternion.copy(carBody.quaternion)
    // engine.rotateX(Math.PI*1.5)
    
    // }
    

    // frontWheelMesh2.position.copy(wheelBody4.position)
    // frontWheelMesh2.quaternion.copy(wheelBody4.quaternion)

    // //frontWheelMesh2.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2)

    

    if(frontWheelMesh1){
    frontWheelMesh1.position.copy(wheelBody3.position)
    frontWheelMesh1.quaternion.copy(wheelBody3.quaternion)
    }

    if(frontWheelMesh2){
    frontWheelMesh2.position.copy(wheelBody4.position)
    frontWheelMesh2.quaternion.copy(wheelBody4.quaternion)
    }

    if(rearWheelMesh1){
    rearWheelMesh1.position.copy(wheelBody1.position)
    rearWheelMesh1.quaternion.copy(wheelBody1.quaternion)
    }

    if(rearWheelMesh2){
    rearWheelMesh2.position.copy(wheelBody2.position)
    rearWheelMesh2.quaternion.copy(wheelBody2.quaternion)
    }

    // //frontWheelMesh1.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2)

    // rearWheelMesh1.position.copy(wheelBody1.position)
    // rearWheelMesh1.quaternion.copy(wheelBody1.quaternion)

    // //rearWheelMesh1.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2)
    // // rearWheelMesh1.rotation.y = Math.PI/2

    // rearWheelMesh2.position.copy(wheelBody2.position)
    // rearWheelMesh2.quaternion.copy(wheelBody2.quaternion)


    //rearWheelMesh2.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2)
    // rearWheelMesh2.rotation.y = Math.PI/2

    // a.lerp(chassisMesh.position, 0.4);
    // b.copy(goal.position);

    // dir.copy(a).sub(b).normalize();
    // const dis = a.distanceTo(b) - coronaSafetyDistance;
    // goal.position.addScaledVector(dir, dis);
    // goal.position.lerp(temp, 0.02);
    // temp.setFromMatrixPosition(follow.matrixWorld);

    // camera.lookAt(chassisMesh.position);

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Physics

    world.fixedStep()
    //cannonDebugger.update()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

// Call tick when testing the experimental car
//tick()

/**
 * Steering
 */

document.addEventListener("keydown", (event) => {
    const maxSteerVal = Math.PI / 8
    const maxSpeed = 10
    const maxForce = 10

    switch (event.key) {
        case "w":
        case "ArrowUp":
            //console.log(vehicle)
            vehicle.setWheelForce(maxForce, 0)
            vehicle.setWheelForce(-maxForce, 1)
            break

        case 's':
        case 'ArrowDown':
            vehicle.setWheelForce(-maxForce * 0.5, 0)
            vehicle.setWheelForce(maxForce * 0.5, 1)
            break

        case 'a':
        case 'ArrowLeft':
            vehicle.setSteeringValue(maxSteerVal, 2)
            vehicle.setSteeringValue(maxSteerVal, 3)
            break

        case 'd':
        case 'ArrowRight':
            vehicle.setSteeringValue(-maxSteerVal, 2)
            vehicle.setSteeringValue(-maxSteerVal, 3)
            break

        // case ' ':
        //     chassisBody.applyLocalForce(new CANNON.Vec3(0, 10000, 0), new CANNON.Vec3(0, 0, 0))
    }
})

// Reset force on keyup
document.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'w':
        case 'ArrowUp':
            vehicle.setWheelForce(0, 0)
            vehicle.setWheelForce(0, 1)
            break

        case 's':
        case 'ArrowDown':
            vehicle.setWheelForce(0, 0)
            vehicle.setWheelForce(0, 1)
            break

        case 'a':
        case 'ArrowLeft':
            vehicle.setSteeringValue(0, 2)
            vehicle.setSteeringValue(0, 3)
            break

        case 'd':
        case 'ArrowRight':
            vehicle.setSteeringValue(0, 2)
            vehicle.setSteeringValue(0, 3)
            break

        // case ' ':
        //     chassisBody.applyLocalForce(new CANNON.Vec3(0, 0, 0), new CANNON.Vec3(0, 0, 0))
    }
})


/**
 * Create a Cannnon Car using 
 * the convex Polyhedron
 */

//  let vertices = [[-0.35904404520988464, -1.6336852312088013, -0.12933169305324554],
//  [-0.44894835352897644, 1.7432230710983276, -0.5665733814239502],
//  [0.35464590787887573, -0.290310800075531, 0.6102550029754639],
//  [0.6549844145774841, -1.0672518014907837, -0.6599217653274536],
//  [-0.3973194658756256, -0.24185653030872345, 0.5005074739456177],
//  [0.41844698786735535, -1.5749677419662476, -0.016115598380565643],
//  [0.6806283593177795, 1.4970229864120483, -0.5623975992202759],
//  [-0.6860529184341431, -1.0487329959869385, -0.6599761247634888],
//  [-0.4211280345916748, -1.1658895015716553, 0.23820710182189941],
//  [0.0197290051728487, -0.2859078347682953, 0.611619770526886],
//  [0.6550124287605286, -1.0644173622131348, -0.3851877450942993],
//  [0.4182984232902527, -1.5864415168762207, -0.26071587204933167],
//  [0.20845992863178253, 1.4074171781539917, -0.7370172739028931],
//  [0.49488067626953125, 1.7173808813095093, -0.5438137054443359],
//  [-0.6486438512802124, 1.456320881843567, -0.441214382648468],
//  [-0.46253764629364014, -1.5628019571304321, -0.016151297837495804],
//  [-0.6860248446464539, -1.0458984375, -0.38524213433265686],
//  [0.30022794008255005, -1.1538413763046265, 0.28321388363838196],
//  [-0.3974182605743408, -0.24924679100513458, 0.5005481839179993],
//  [0.42686083912849426, -1.1592257022857666, 0.2103668451309204],
//  [0.6875537633895874, 1.3365987539291382, -0.42481687664985657],
//  [0.41786032915115356, -1.6178004741668701, -0.13667535781860352],
//  [-0.18896663188934326, -1.379628300666809, -0.5435677766799927],
//  [0.6854808926582336, 1.3816806077957153, -0.6971345543861389],
//  [-0.6482086777687073, 1.4086487293243408, -0.6961807012557983],
//  [-0.07628145068883896, -1.0651339292526245, -0.7026261687278748],
//  [0.4948746860027313, 1.716778039932251, -0.6022288799285889],
//  [0.49472302198410034, 1.7059825658798218, -0.537074625492096],
//  [-0.44928374886512756, 1.7190186977386475, -0.5371128916740417],
//  [-0.46294403076171875, -1.5928312540054321, -0.22173891961574554],
//  [-0.36527547240257263, -1.6267402172088623, -0.08081728965044022],
//  [-0.6493626236915588, 1.5240885019302368, -0.5614451169967651],
//  [-0.6481810808181763, 1.4114530086517334, -0.4243568181991577],
//  [-0.45868831872940063, -1.147278070449829, 0.21068470180034637],
//  [0.13360176980495453, -1.4783049821853638, 0.10463906079530716],
//  [-0.07925235480070114, -1.1486009359359741, 0.2831985056400299],
//  [0.01959165558218956, -0.29584479331970215, 0.6099697947502136],
//  [0.5232361555099487, -0.5996112823486328, 0.13030952215194702],
//  [0.41932255029678345, -1.5113894939422607, 0.04177010804414749],
//  [0.4103940725326538, -1.1724647283554077, 0.22924791276454926],
//  [0.6924062371253967, 1.221256971359253, -0.5595538020133972],
//  [0.6835850477218628, 1.429314374923706, -0.4421676993370056],
//  [0.33262938261032104, -1.618593692779541, -0.18045353889465332],
//  [0.6535277366638184, -1.1721848249435425, -0.47374528646469116],
//  [0.4153062403202057, -1.3834012746810913, -0.4915675222873688],
//  [0.6875261664390564, 1.333794355392456, -0.6966407299041748],
//  [-0.44929105043411255, 1.718279480934143, -0.6087697744369507],
//  [0.044996097683906555, -1.0668087005615234, -0.7026211619377136],
//  [-0.07710345089435577, -1.1245930194854736, -0.6802852749824524],
//  [-0.1713581085205078, 1.412662148475647, -0.7370327115058899],
//  [0.495057076215744, 1.7300503253936768, -0.5797767639160156],
//  [0.49471569061279297, 1.7052433490753174, -0.6087313890457153],
//  [0.6819970011711121, 1.4638490676879883, -0.6507753133773804],
//  [-0.45879265666007996, 1.736646294593811, -0.5553869009017944],
//  [-0.2463257610797882, 1.7162160873413086, -0.5371046662330627],
//  [-0.6876305341720581, -1.162569284439087, -0.521419882774353],
//  [-0.45520973205566406, -1.3713798522949219, -0.4916028678417206],
//  [-0.37753063440322876, -1.5790772438049316, -0.2629319131374359],
//  [-0.46312427520751953, -1.6056346893310547, -0.13671104609966278],
//  [0.3326825201511383, -1.6144870519638062, -0.09291186183691025],
//  [-0.6492725610733032, 1.5162529945373535, -0.5141575932502747],
//  [-0.6837783455848694, -0.8836236000061035, -0.5242981910705566],
//  [-0.6490409970283508, 1.49088716506958, -0.6498224139213562],
//  [-0.6853559613227844, -0.9974600076675415, -0.3857419192790985],
//  [-0.46166202425956726, -1.4992238283157349, 0.04173441603779793],
//  [-0.4425409734249115, -1.1607614755630493, 0.2293187975883484],
//  [0.3331943452358246, -1.577195644378662, -0.013605493120849133],
//  [-0.3769732117652893, -1.5378886461257935, 0.019055761396884918],
//  [0.014900192618370056, -1.1715397834777832, 0.27417808771133423],
//  [0.35450854897499084, -0.3002476990222931, 0.6086050271987915],
//  [-0.23218189179897308, -1.168238878250122, 0.26340821385383606],
//  [0.5235062837600708, -0.586784303188324, 0.13243649899959564],
//  [0.6543821096420288, -1.1101055145263672, -0.4012865424156189],
//  [0.4188452959060669, -1.546028971672058, 0.015958497300744057],
//  [0.16506536304950714, -1.4573097229003906, 0.11515108495950699],
//  [0.3244101107120514, -1.1534048318862915, 0.279397577047348],
//  [0.6910375952720642, 1.2544306516647339, -0.47117623686790466],
//  [0.6820151209831238, 1.46567964553833, -0.4733547866344452],
//  [0.504461407661438, 1.704914927482605, -0.5395580530166626],
//  [0.6855085492134094, 1.384484887123108, -0.4253107011318207],
//  [0.33259642124176025, -1.620850920677185, -0.136480450630188],
//  [0.41804057359695435, -1.6049970388412476, -0.22170323133468628],
//  [0.4181429147720337, -1.5970937013626099, -0.053219616413116455],
//  [0.6535180807113647, -1.1731692552566528, -0.5691593885421753],
//  [0.17859406769275665, -1.3845152854919434, -0.5252701044082642],
//  [0.2079102247953415, 1.367611289024353, -0.7366065382957458],
//  [0.6910195350646973, 1.2526001930236816, -0.6485966444015503],
//  [0.6809787154197693, 1.4882206916809082, -0.6095136404037476],
//  [-0.6866797804832458, -1.0940791368484497, -0.6429380178451538],
//  [0.04417409002780914, -1.1262677907943726, -0.6802803874015808],
//  [-0.17190781235694885, 1.3728563785552979, -0.7366220355033875],
//  [-0.2463330626487732, 1.7154768705368042, -0.6087615489959717],
//  [0.49499717354774475, 1.7257870435714722, -0.5540453195571899],
//  [-0.44901350140571594, 1.7384295463562012, -0.5922114253044128],
//  [0.6835606694221497, 1.426848292350769, -0.6812057495117188],
//  [0.5047128796577454, 1.7229750156402588, -0.5908223986625671],
//  [-0.4589010179042816, 1.7288249731063843, -0.545867383480072],
//  [-0.44912612438201904, 1.7304168939590454, -0.5438520312309265],
//  [-0.6871707439422607, -1.1290138959884644, -0.4320966601371765],
//  [0.3330429494380951, -1.5888899564743042, -0.2629031538963318],
//  [-0.46232840418815613, -1.5484669208526611, -0.29539430141448975],
//  [-0.37779343128204346, -1.5979890823364258, -0.22317002713680267],
//  [-0.4630919098854065, -1.6034198999404907, -0.17985554039478302],
//  [-0.3832756578922272, -1.6293489933013916, -0.1007506474852562],
//  [-0.4628416895866394, -1.584928035736084, -0.05325530469417572],
//  [-0.4659726619720459, 1.7336878776550293, -0.5681929588317871],
//  [-0.6842381358146667, -0.9171788692474365, -0.6136214137077332],
//  [-0.6486682295799255, 1.4538546800613403, -0.6802523136138916],
//  [-0.6492822766304016, 1.515278935432434, -0.6085609793663025],
//  [-0.6490228772163391, 1.4927178621292114, -0.47240182757377625],
//  [-0.6842197775840759, -0.9153288006782532, -0.43430158495903015],
//  [-0.6866551637649536, -1.0915865898132324, -0.4013409912586212],
//  [-0.37737929821014404, -1.5673831701278687, -0.013634288683533669],
//  [-0.4621392786502838, -1.5338631868362427, 0.01592281460762024],
//  [-0.047509483993053436, -1.1706781387329102, 0.27416789531707764],
//  [-0.14130499958992004, -1.169420838356018, 0.2704769968986511],
//  [0.655681312084198, -1.0159786939620972, -0.38568753004074097],
//  [0.6538665294647217, -1.1475328207015991, -0.4320422410964966],
//  [0.15127049386501312, -1.4744240045547485, 0.1054895669221878],
//  [0.33360034227371216, -1.547701120376587, 0.01908455789089203],
//  [0.3889286518096924, -1.1770761013031006, 0.23821669816970825],
//  [0.6920560598373413, 1.230059266090393, -0.5124377012252808],
//  [0.5046080946922302, 1.7155197858810425, -0.5458281636238098],
//  [0.4179448187351227, -1.6115565299987793, -0.09392766654491425],
//  [-0.33388209342956543, -1.6300384998321533, -0.10146729648113251],
//  [0.4178926646709442, -1.6155855655670166, -0.17981986701488495],
//  [0.3327801525592804, -1.6078015565872192, -0.22314122319221497],
//  [0.33288440108299255, -1.5997464656829834, -0.051422059535980225],
//  [0.6538482308387756, -1.1493828296661377, -0.6113621592521667],
//  [0.6534067988395691, -1.1810882091522217, -0.5213655233383179],
//  [0.41865620017051697, -1.5606327056884766, -0.2953586280345917],
//  [-0.0156426839530468, -1.0659713745117188, -0.7026236653327942],
//  [0.6920464634895325, 1.2290854454040527, -0.6068412661552429],
//  [0.689449667930603, 1.2889653444290161, -0.679783821105957],
//  [-0.6871890425682068, -1.130863904953003, -0.6114165782928467],
//  [0.6543575525283813, -1.1125978231430054, -0.6428835391998291],
//  [0.01800120249390602, 1.3702337741851807, -0.7366142868995667],
//  [-0.6477178335189819, 1.360721230506897, -0.6956862211227417],
//  [0.018550915643572807, 1.4100396633148193, -0.7370250225067139],
//  [0.2917576730251312, 1.7080460786819458, -0.6087396740913391],
//  [-0.24617403745651245, 1.7270114421844482, -0.6022589802742004],
//  [0.49505844712257385, 1.730186939239502, -0.5665349960327148],
//  [-0.4489497244358063, 1.743086576461792, -0.5798150300979614],
//  [0.49499326944351196, 1.7253936529159546, -0.5921730995178223],
//  [-0.4589065909385681, 1.728264331817627, -0.6002175211906433],
//  [0.5046026110649109, 1.7149590253829956, -0.6001784205436707],
//  [0.5117648839950562, 1.7166367769241333, -0.5871328711509705],
//  [-0.45904773473739624, 1.7182203531265259, -0.5395970940589905],
//  [0.2919226288795471, 1.7201836109161377, -0.5438219308853149],
//  [-0.44900962710380554, 1.7388229370117188, -0.5540835857391357],
//  [-0.34251195192337036, -1.5795608758926392, -0.2629305422306061],
//  [0.33340758085250854, -1.5625852346420288, -0.29821115732192993],
//  [-0.3771659731864929, -1.5527726411819458, -0.29823988676071167],
//  [-0.4626861810684204, -1.5742758512496948, -0.2607516050338745],
//  [-0.3724687695503235, -1.6329421997070312, -0.1252138912677765],
//  [-0.6875191926956177, -1.154650330543518, -0.5692138075828552],
//  [-0.4630398154258728, -1.5993907451629639, -0.09396335482597351],
//  [-0.6875095367431641, -1.1536661386489868, -0.4737996757030487],
//  [-0.3772266209125519, -1.6276395320892334, -0.08817212283611298],
//  [-0.46601802110671997, 1.7304306030273438, -0.5589467883110046],
//  [-0.4587356448173523, 1.7407402992248535, -0.5670076012611389],
//  [-0.6838993430137634, -0.8925269246101379, -0.5719185471534729],
//  [-0.6838896870613098, -0.8915424346923828, -0.476504385471344],
//  [-0.6847537159919739, -0.9546061158180237, -0.6443771123886108],
//  [-0.6853839755058289, -1.00029456615448, -0.6604759097099304],
//  [-0.4659736454486847, 1.7335867881774902, -0.5779956579208374],
//  [-0.6847290992736816, -0.952113687992096, -0.40278008580207825],
//  [0.6894739270210266, 1.2914316654205322, -0.4407458007335663],
//  [0.6809881925582886, 1.489194631576538, -0.5151101350784302],
//  [0.5047164559364319, 1.7233409881591797, -0.555347740650177],
//  [-0.3512166142463684, -1.6269365549087524, -0.0810212641954422],
//  [-0.3454899787902832, -1.6333187818527222, -0.12560531497001648],
//  [0.2977614402770996, -1.6073180437088013, -0.22314266860485077],
//  [0.4522916376590729, -1.3745919466018677, -0.4834800660610199],
//  [-0.49193841218948364, -1.3615529537200928, -0.4835183918476105],
//  [0.4155164062976837, -1.368210792541504, -0.5022867918014526],
//  [0.018416481092572212, 1.4003050327301025, -0.7369245886802673],
//  [-0.4491320848464966, 1.7298139333724976, -0.6022672653198242],
//  [0.5047734379768372, 1.7274348735809326, -0.5669685006141663],
//  [-0.24599166214466095, 1.7402838468551636, -0.5798068046569824],
//  [0.2921003997325897, 1.7329896688461304, -0.5665432810783386],
//  [0.5047722458839417, 1.727307677268982, -0.57928866147995],
//  [-0.45905452966690063, 1.7175323963165283, -0.6062675714492798],
//  [-0.4587962329387665, 1.7362803220748901, -0.5908615589141846],
//  [0.5044546127319336, 1.7042269706726074, -0.6062284708023071],
//  [-0.34277471899986267, -1.5984727144241333, -0.22316862642765045],
//  [-0.3815019726753235, -1.6313257217407227, -0.11455930024385452],
//  [0.5117677450180054, 1.7169281244277954, -0.5589070320129395],
//  [-0.3395135998725891, -1.6281659603118896, -0.08871930092573166],
//  [-0.33610999584198, -1.631959319114685, -0.1152178943157196],
//  [-0.501529335975647, -1.3583155870437622, -0.48082494735717773],
//  [0.5118131041526794, 1.7201855182647705, -0.5681532025337219],
//  [0.5118120908737183, 1.7200844287872314, -0.5779559016227722],
//  [-0.46602094173431396, 1.7301393747329712, -0.5871725678443909],
//  [-0.4587368667125702, 1.7406132221221924, -0.5793277621269226]]
 
//  let faces = [[14, 4, 9],
//  [18, 9, 4],
//  [18, 4, 16],
//  [27, 9, 2],
//  [28, 14, 9],
//  [32, 4, 14],
//  [33, 18, 16],
//  [36, 2, 9],
//  [36, 35, 17],
//  [36, 18, 8],
//  [36, 9, 18],
//  [37, 19, 10],
//  [39, 38, 19],
//  [41, 27, 2],
//  [45, 12, 23],
//  [49, 24, 46],
//  [51, 23, 12],
//  [54, 28, 9],
//  [54, 9, 27],
//  [54, 27, 13],
//  [63, 16, 4],
//  [63, 4, 32],
//  [63, 32, 14],
//  [63, 60, 31],
//  [65, 8, 18],
//  [65, 18, 33],
//  [65, 64, 8],
//  [65, 33, 64],
//  [66, 34, 30],
//  [68, 34, 17],
//  [68, 17, 35],
//  [69, 36, 17],
//  [69, 2, 36],
//  [69, 39, 19],
//  [69, 19, 37],
//  [70, 36, 8],
//  [70, 8, 64],
//  [71, 20, 2],
//  [71, 37, 10],
//  [71, 69, 37],
//  [71, 2, 69],
//  [72, 10, 19],
//  [72, 19, 38],
//  [72, 40, 10],
//  [73, 66, 5],
//  [73, 72, 38],
//  [74, 38, 17],
//  [74, 17, 34],
//  [75, 17, 38],
//  [75, 69, 17],
//  [77, 41, 6],
//  [78, 13, 27],
//  [78, 27, 41],
//  [79, 41, 2],
//  [79, 2, 20],
//  [79, 20, 41],
//  [80, 42, 21],
//  [80, 0, 42],
//  [82, 5, 66],
//  [83, 81, 11],
//  [85, 45, 3],
//  [85, 12, 45],
//  [85, 3, 47],
//  [87, 6, 41],
//  [88, 48, 22],
//  [88, 22, 56],
//  [88, 7, 25],
//  [88, 25, 48],
//  [89, 48, 25],
//  [89, 84, 22],
//  [89, 22, 48],
//  [89, 47, 3],
//  [90, 25, 7],
//  [90, 24, 49],
//  [91, 49, 46],
//  [94, 23, 51],
//  [94, 52, 87],
//  [94, 87, 45],
//  [94, 45, 23],
//  [97, 28, 54],
//  [97, 53, 96],
//  [99, 11, 81],
//  [100, 56, 22],
//  [101, 0, 29],
//  [102, 58, 55],
//  [104, 15, 98],
//  [104, 30, 15],
//  [105, 31, 60],
//  [107, 46, 24],
//  [109, 63, 14],
//  [109, 60, 63],
//  [109, 14, 96],
//  [109, 96, 53],
//  [109, 53, 60],
//  [111, 64, 33],
//  [111, 33, 16],
//  [111, 16, 63],
//  [112, 15, 30],
//  [112, 30, 34],
//  [112, 34, 67],
//  [113, 67, 34],
//  [113, 112, 67],
//  [113, 34, 64],
//  [113, 98, 15],
//  [113, 15, 112],
//  [113, 111, 98],
//  [113, 64, 111],
//  [114, 68, 35],
//  [114, 34, 68],
//  [115, 35, 36],
//  [115, 36, 70],
//  [115, 114, 35],
//  [115, 34, 114],
//  [115, 70, 64],
//  [115, 64, 34],
//  [116, 71, 10],
//  [116, 20, 71],
//  [116, 10, 76],
//  [117, 43, 40],
//  [117, 40, 72],
//  [117, 73, 5],
//  [117, 72, 73],
//  [117, 82, 43],
//  [117, 5, 82],
//  [118, 73, 38],
//  [118, 34, 73],
//  [118, 74, 34],
//  [118, 38, 74],
//  [119, 73, 34],
//  [119, 34, 66],
//  [119, 66, 73],
//  [120, 75, 38],
//  [120, 38, 39],
//  [120, 39, 69],
//  [120, 69, 75],
//  [121, 76, 10],
//  [121, 10, 40],
//  [121, 41, 20],
//  [121, 20, 76],
//  [122, 78, 41],
//  [122, 41, 77],
//  [122, 13, 78],
//  [123, 80, 21],
//  [123, 59, 80],
//  [123, 82, 59],
//  [123, 43, 82],
//  [124, 80, 59],
//  [125, 21, 42],
//  [125, 42, 81],
//  [125, 81, 83],
//  [126, 81, 42],
//  [126, 42, 0],
//  [126, 99, 81],
//  [127, 82, 66],
//  [127, 59, 82],
//  [128, 83, 11],
//  [128, 40, 83],
//  [129, 83, 40],
//  [129, 40, 43],
//  [129, 123, 21],
//  [129, 43, 123],
//  [129, 125, 83],
//  [129, 21, 125],
//  [130, 84, 44],
//  [130, 128, 11],
//  [130, 11, 99],
//  [131, 85, 47],
//  [131, 25, 85],
//  [131, 89, 25],
//  [131, 47, 89],
//  [132, 40, 3],
//  [132, 3, 86],
//  [132, 121, 40],
//  [132, 45, 87],
//  [132, 87, 41],
//  [132, 41, 121],
//  [133, 86, 3],
//  [133, 132, 86],
//  [133, 3, 45],
//  [133, 45, 132],
//  [134, 7, 88],
//  [134, 88, 56],
//  [135, 89, 3],
//  [135, 84, 89],
//  [135, 128, 44],
//  [135, 3, 40],
//  [135, 40, 128],
//  [136, 85, 25],
//  [136, 25, 90],
//  [137, 90, 7],
//  [137, 7, 24],
//  [137, 24, 90],
//  [138, 90, 49],
//  [138, 49, 91],
//  [139, 51, 12],
//  [139, 91, 26],
//  [139, 26, 51],
//  [139, 138, 91],
//  [139, 12, 138],
//  [140, 91, 46],
//  [140, 26, 91],
//  [141, 1, 92],
//  [143, 93, 142],
//  [143, 140, 93],
//  [143, 26, 140],
//  [144, 107, 62],
//  [145, 51, 26],
//  [145, 95, 52],
//  [145, 52, 94],
//  [145, 143, 95],
//  [145, 26, 143],
//  [146, 87, 52],
//  [146, 52, 95],
//  [147, 96, 14],
//  [147, 14, 28],
//  [147, 97, 96],
//  [147, 28, 97],
//  [148, 97, 54],
//  [148, 54, 13],
//  [148, 13, 92],
//  [148, 92, 97],
//  [149, 97, 92],
//  [149, 92, 1],
//  [149, 53, 97],
//  [150, 57, 22],
//  [150, 22, 99],
//  [150, 101, 57],
//  [151, 99, 22],
//  [151, 22, 84],
//  [151, 130, 99],
//  [151, 84, 130],
//  [152, 100, 22],
//  [152, 22, 57],
//  [152, 57, 100],
//  [153, 100, 57],
//  [153, 101, 29],
//  [153, 57, 101],
//  [153, 134, 100],
//  [154, 102, 29],
//  [154, 29, 0],
//  [155, 102, 55],
//  [155, 29, 102],
//  [155, 55, 134],
//  [155, 153, 29],
//  [155, 134, 153],
//  [156, 55, 58],
//  [156, 58, 103],
//  [157, 104, 98],
//  [157, 98, 111],
//  [157, 156, 104],
//  [157, 55, 156],
//  [157, 106, 7],
//  [157, 134, 55],
//  [157, 7, 134],
//  [158, 103, 30],
//  [158, 30, 104],
//  [158, 156, 103],
//  [158, 104, 156],
//  [159, 105, 60],
//  [159, 60, 53],
//  [160, 159, 53],
//  [160, 105, 159],
//  [160, 149, 1],
//  [160, 53, 149],
//  [160, 1, 142],
//  [161, 106, 61],
//  [161, 61, 31],
//  [161, 31, 106],
//  [162, 61, 106],
//  [162, 106, 157],
//  [162, 110, 31],
//  [162, 31, 61],
//  [163, 106, 31],
//  [163, 7, 106],
//  [164, 107, 24],
//  [164, 24, 7],
//  [164, 62, 107],
//  [164, 108, 62],
//  [164, 31, 108],
//  [164, 163, 31],
//  [164, 7, 163],
//  [165, 108, 31],
//  [165, 31, 105],
//  [165, 105, 160],
//  [166, 63, 31],
//  [166, 110, 162],
//  [166, 31, 110],
//  [166, 111, 63],
//  [166, 162, 157],
//  [166, 157, 111],
//  [167, 116, 76],
//  [167, 76, 20],
//  [167, 20, 116],
//  [168, 77, 6],
//  [169, 92, 13],
//  [169, 13, 122],
//  [169, 122, 77],
//  [170, 59, 127],
//  [170, 30, 103],
//  [170, 127, 66],
//  [170, 66, 30],
//  [170, 103, 0],
//  [170, 0, 124],
//  [171, 124, 0],
//  [171, 0, 80],
//  [172, 99, 126],
//  [172, 126, 0],
//  [173, 130, 44],
//  [173, 44, 128],
//  [173, 128, 130],
//  [174, 134, 56],
//  [174, 56, 100],
//  [175, 135, 44],
//  [175, 44, 84],
//  [175, 84, 135],
//  [176, 136, 90],
//  [176, 90, 138],
//  [176, 85, 136],
//  [176, 138, 12],
//  [176, 12, 85],
//  [177, 140, 46],
//  [177, 93, 140],
//  [177, 46, 144],
//  [178, 50, 141],
//  [178, 141, 92],
//  [178, 92, 169],
//  [179, 141, 50],
//  [179, 143, 142],
//  [179, 50, 143],
//  [180, 142, 1],
//  [180, 1, 141],
//  [180, 179, 142],
//  [180, 141, 179],
//  [181, 143, 50],
//  [181, 95, 143],
//  [181, 50, 178],
//  [182, 144, 46],
//  [182, 46, 107],
//  [182, 107, 144],
//  [183, 144, 62],
//  [183, 62, 108],
//  [183, 142, 93],
//  [183, 177, 144],
//  [183, 93, 177],
//  [184, 145, 94],
//  [184, 94, 51],
//  [184, 51, 145],
//  [185, 150, 99],
//  [185, 101, 150],
//  [185, 99, 172],
//  [185, 172, 0],
//  [185, 0, 101],
//  [186, 154, 0],
//  [186, 0, 103],
//  [186, 103, 58],
//  [186, 58, 102],
//  [186, 102, 154],
//  [187, 169, 77],
//  [187, 77, 168],
//  [188, 170, 124],
//  [188, 124, 59],
//  [188, 59, 170],
//  [189, 171, 80],
//  [189, 80, 124],
//  [189, 124, 171],
//  [190, 174, 100],
//  [190, 100, 134],
//  [190, 134, 174],
//  [191, 168, 6],
//  [191, 187, 168],
//  [191, 178, 169],
//  [191, 169, 187],
//  [192, 146, 95],
//  [192, 95, 181],
//  [192, 87, 146],
//  [192, 181, 178],
//  [192, 178, 191],
//  [192, 191, 6],
//  [192, 6, 87],
//  [193, 183, 108],
//  [193, 108, 165],
//  [194, 165, 160],
//  [194, 193, 165],
//  [194, 183, 193],
//  [194, 160, 142],
//  [194, 142, 183]]
 
//  // console.log(vertices)
 
//  //console.log(faces[0][0], faces[0][1], faces[0][2])
 
//  let cannon_vertices = []
 
//  let cannon_faces = []
 
//  for (const ver of vertices) { 
//      let x = ver[0]
//      let y = ver[1]
//      let z = ver[2]
//      cannon_vertices.push(new CANNON.Vec3(x, y, z))
//  }
 
//  for (const face of faces) { 
//      let x = face[0]
//      let y = face[1]
//      let z = face[2]
//      cannon_faces.push([x,y,z])
//  }
 
//  console.log(cannon_vertices)
//  console.log(faces)

 
//  const convexShape = new CANNON.ConvexPolyhedron(cannon_vertices, faces )
//  const chassisBody = new CANNON.Body({ mass: 100, shape: convexShape, position: new Vec3(0,0,0) })

//  console.log(convexShape)
//  console.log(chassisBody)
 
 
 


//  const vehicle = new CANNON.RigidVehicle({
//     chassisBody: chassisBody
// })



// const mass = 10
// const axisWidthFront = 1.326
// const axisWidthRear = 1.333

// const rearRadiusTop = 0.44
// const rearRadiusBottom = 0.44
// const rearHeight = 0.26
// const rearNumSegments = 32
// const rearWheelShape = new CANNON.Cylinder(rearRadiusTop, rearRadiusBottom, rearHeight, rearNumSegments)
// const quaternion = new CANNON.Quaternion().setFromEuler(0, 0, -Math.PI / 2)

// const frontRadiusTop = 0.395
// const frontRadiusBottom = 0.395
// const frontHeight = 0.14
// const frontNumSegments = 32
// const frontWheelShape = new CANNON.Cylinder(frontRadiusTop, frontRadiusBottom, frontHeight, frontNumSegments)

// const wheelMaterial = new CANNON.Material('wheel')
// const down = new CANNON.Vec3(0, -1, 0)


// // const wheelBody1 = new CANNON.Body({ mass, material: wheelMaterial })
// // wheelBody1.addShape(rearWheelShape, new CANNON.Vec3(), quaternion)
// // vehicle.addWheel({
// //     body: wheelBody1,
// //     //position: new CANNON.Vec3(debugObject.wheel1X,  -0.3346, 0.977),
// //     position: new CANNON.Vec3(0.609667,  -0.5354, 1.07682),
// //     axis: new CANNON.Vec3(1, 0, 0),
// //     direction: down
// // })



// // const wheelBody2 = new CANNON.Body({ mass, material: wheelMaterial })
// // wheelBody2.addShape(rearWheelShape, new CANNON.Vec3(), quaternion)
// // vehicle.addWheel({
// //     body: wheelBody2,
// //     position: new CANNON.Vec3(-0.7548, -0.3346, 0.977),
// //     axis: new CANNON.Vec3(1, 0, 0),
// //     direction: down
// // })

// // const wheelBody3 = new CANNON.Body({ mass, material: wheelMaterial })
// // wheelBody3.addShape(rearWheelShape, new CANNON.Vec3(), quaternion)
// // vehicle.addWheel({
// //     body: wheelBody3,
// //     position: new CANNON.Vec3(0.7548, -0.3346, -0.55285),
// //     axis: new CANNON.Vec3(1, 0, 0),
// //     direction: down
// // })


// // const wheelBody4 = new CANNON.Body({ mass, material: wheelMaterial })
// // wheelBody4.addShape(rearWheelShape, new CANNON.Vec3(), quaternion)
// // vehicle.addWheel({
// //     body: wheelBody4,
// //     position: new CANNON.Vec3(-0.7548, -0.3346, -0.55285),
// //     axis: new CANNON.Vec3(1, 0, 0),
// //     direction: down
// // })

// // vehicle.wheelBodies.forEach((wheelBody) => {
// //     wheelBody.angularDamping = .4
// // })







// vehicle.addToWorld(world)


// console.log(vehicle)
