import '/style.css'
import * as THREE from 'three'
import gsap from 'gsap'
import { GLTFLoader } from 'three/src/examples/jsm/Addons.js'
import { TextGeometry } from 'three/src/examples/jsm/geometries/TextGeometry.js'
import { FontLoader } from 'three/src/examples/jsm/loaders/FontLoader.js'


/**
 * Debug
 */


const parameters = {
    materialColor: '#ffeded',
}


/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Objects
 */

// Texture
const sectionsMeshes = []
const textureLoader = new THREE.TextureLoader()
const gltfload = new GLTFLoader()
const gradientTexture = textureLoader.load('/textures/gradients/3.jpg')
// const vinylTexture = textureLoader.load('static/textures/turntable/textures/chrome.CHINCHE_normal.jpeg')
gradientTexture.magFilter = THREE.NearestFilter
let turntable
gltfload.load('static/textures/turntable/scene.gltf', (object) => {
    turntable = object.scene
    turntable.position.set(0.5, -0.1, 4.5)
    scene.add(turntable)
    sectionsMeshes.push(turntable)
})

// Material
// const material = new THREE.MeshToonMaterial({
//     color: parameters.materialColor,
//     gradientMap: gradientTexture
//     })
const fontLoader = new FontLoader()
const matcapTexture = textureLoader.load('static/textures/8.png')
let TextSize = 0.25
fontLoader.load(
'static/fonts/Codec_Cold_Trial_ExtraBold.json',
(font) => {
    const textGeometry = new TextGeometry(
        "Discover Your Spotify Vinyl",
        {
            font: font,
            size: TextSize,
            height: 0.2,
            curveSegments:5,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 4
        }
        )
        // TODO: Add top tracks to text
        // for(let i = 0; i < topTracks.length; i++) {
        //     const songGeometry = new TextGeometry(`${topTracks[i].name} by ${topTracks[i].artists.map(artist => artist.name).join(', ')}`)
        //     scene.add(songGeometry)
        // }
        const songGeometry = new TextGeometry(``)
        textGeometry.center()
        // textGeometry.position.y = 0
        textGeometry.computeBoundingBox()
        const material = new THREE.MeshMatcapMaterial({matcap: matcapTexture })
        // const color = new THREE.Color(0x0dc1d9)
        // const material = new THREE.MeshBasicMaterial({color:color})
        const text = new THREE.Mesh(textGeometry, material)
        text.position.y = 1.5
        scene.add(text)
    })
    
    
// Meshes
const objectsDistance = 4

// particles
// part geometries
const particlesCount = 500
const position =  new Float32Array(particlesCount * 3)


for (let i = 0; i < particlesCount; i++) {
    position[i * 3 + 0] = (Math.random() - 0.5) * 10
    position[i * 3 + 1] = objectsDistance * 0.5  - Math.random() * objectsDistance
    position[i * 3 + 2] = (Math.random() - 0.5) * 10
}

const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(position, 3))


// Material 
const particlesMaterial = new THREE.PointsMaterial({
    color: parameters.materialColor,
    sizeAttenuation: true,
    size: 0.03
})

const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

// Lights

const directionalLight = new THREE.DirectionalLight('#ffffff', 1)

scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
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
// Group
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha:true
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


// Cursor
const cursor = {}
cursor.x = 0
cursor.y= 0

window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5
})
/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0


const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    // Use Delta time to make all devices work with the different frame rates
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime
    
    // Animate Camera

    camera.position.y = - scrollY / sizes.height * objectsDistance

    const parallaxX = cursor.x * 0.5
    const parallaxY = - cursor.y * 0.5
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime


    // animate meshes
    for (const mesh of sectionsMeshes) {
        // mesh.rotation.x += deltaTime * 0.1
        mesh.rotation.x = 0.75
        mesh.rotation.z = 0.3* ( 1 +  Math.sin( elapsedTime ) );
        // if(mesh.rotation.z > 1.0) {
        //     mesh.rotation.z -= deltaTime * 0.1
        // }
        // console.log(mesh.rotation.z);
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()