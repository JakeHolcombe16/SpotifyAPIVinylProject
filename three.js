import '/style.css'
import * as THREE from 'three'
import * as dat from 'lil-gui'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
// import { topAlbumCovers } from './loginAPI'
// import typefaceFont from 'three/examples/fonts/helvetiker_regular.typeface.json'
// import gsap from 'gsap'



/**
 * Font Loader
 */
const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load('static/textures/8.png')

const fontLoader = new FontLoader()
let TextSize = 0.5
fontLoader.load(
    'static/fonts/Codec_Cold_Trial_ExtraBold.json',
    (font) => {
        const textGeometry = new TextGeometry(
            'Hello World',
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
        
        
        /**
         * Debug
        */
       const gui = new dat.GUI()
       
       const parameters = {
           materialColor: '#ffeded'
        }
        
        gui
        .addColor(parameters, 'materialColor')
        .onChange( () => {
            material.color.set(parameters.materialColor)
            particlesMaterial.color.set(parameters.materialColor)
        })
        
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
      const tempAlbumCover = textureLoader.load('static/textures/images/1.jpg')
      const tempAlbumCover2 = textureLoader.load('static/textures/images/2.jpg')
      
      // Texture
      const gradientTexture = textureLoader.load('static/textures/gradients/3.jpg')
      gradientTexture.magFilter = THREE.NearestFilter
      
      // Material
      const material = new THREE.MeshToonMaterial({
          color: parameters.materialColor,
          gradientMap: gradientTexture,
          side:THREE.DoubleSide
        })
        
        
        // Meshes
        const objectsDistance = 4
        const albums = []
        let posY = 0
        let posX = -2
        for (let index = 1; index < 10; index++) {
            const texture = textureLoader.load(`static/textures/images/${index}.jpg`)
            const geo = new THREE.PlaneGeometry(2/3,2/3)
            const mat = new THREE.MeshBasicMaterial({map:texture})
            const mesh = new THREE.Mesh(geo,mat)
            posX++
            mesh.position.x = (posX * 2/3)
            mesh.position.y = posY
            if (index % 3 == 0) {
                posY = posY - 2/3
                posX = -2
            }
            scene.add(mesh)
            albums.push(mesh)

            
}
const vinylMaterial = new THREE.MeshBasicMaterial({
    map:tempAlbumCover
})
const vinylMaterial2 = new THREE.MeshBasicMaterial({
    map:tempAlbumCover2
})
const mesh2 = new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({color: 0x000000}))
// const mesh3 = new THREE.Mesh(new THREE.PlaneGeometry(0.66,0.66),vinylMaterial2)
mesh2.position.x = 0
// mesh3.position.set(-2/3,2/3,0.1)
// scene.add(mesh3)

// mesh1.position.y = - objectsDistance * 0

// mesh1.position.x = 0

const sectionsMeshes = [ mesh2 ]
// const sectionsMeshes = [ mesh1, mesh2, mesh3 ]


// particles
// part geometries
const particlesCount = 200
const position =  new Float32Array(particlesCount * 3)


for (let i = 0; i < particlesCount; i++) {
    position[i * 3 + 0] = (Math.random() - 0.5) * 10
    position[i * 3 + 1] = objectsDistance * 0.5  - Math.random() * objectsDistance * sectionsMeshes.length
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
directionalLight.position.set(1, 1, 0)
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

// Scroll
let scrollY = window.scrollY
let currentSection = 0

window.addEventListener('scroll', () => {
    scrollY = window.scrollY

    const newSection = Math.round(scrollY / sizes.height)
    if(newSection != currentSection) {
        currentSection = newSection

        gsap.to (
            sectionsMeshes[currentSection].rotation, {
                duration: 1.5, 
                ease: 'power2.inOut',
                x: '+=6',
                y: '+=3',
                z: '+= 1.5'
            }
        )
    }


})

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
    // const w = window.matchMedia('(max-width: 1000px)')
    // w.addEventListener('change', () => {
    //     if (w < 1000) {
    //         TextSize = 0.25
    //         scene.remove(text)
    //         scene.add(text)
        
    //     } 
    //     if (w >= 1000){
    //         TextSize = 0.5
    //     }
        
    // })


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
    // TODO: Fix this to follow the mouse
    // for (const mesh of sectionsMeshes) {
    //     mesh.rotation.z += deltaTime * 0.1
    //     mesh.rotation.y += deltaTime * 0.12
    // }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()