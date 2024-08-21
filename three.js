import '/style.css'
import * as THREE from 'three'
import { TextGeometry } from 'three/src/examples/jsm/geometries/TextGeometry.js'
import { FontLoader } from 'three/src/examples/jsm/loaders/FontLoader.js'


/**
 * Font Loader
 */
const seenAlbums = new Set()
const fontLoader = new FontLoader()
const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load('static/textures/8.png')
let r = 0
let topTrackImages = []
const topTracks = []
const loginAPI = import('/loginAPI.js').then((module) => {
    while (seenAlbums.size != 9){
        // TODO: add songs to page and link them to spotify
        // seenAlbums.add(`${module.topTracks[r].name}-${module.topTracks[r].album.images[1].url}*${module.topTracks[r].href}`)
        seenAlbums.add(module.topTracks[r].album.images[1].url)
        topTracks.push(`${module.topTracks[r].name} - ${module.topTracks[r].artists[0].name}`)
        r++
    }
    
    topTrackImages = Array.from(seenAlbums)
    console.log(seenAlbums);

    
    const profile = module.profile.display_name
    console.log(module);
    let TextSize = 0.5
    fontLoader.load(
    'static/fonts/Codec_Cold_Trial_ExtraBold.json',
    (font) => {
        const textGeometry = new TextGeometry(
            `${profile}'s Top Tracks`,
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
}).catch((error) => {
    window.location.href = 'index.html'
})

        
        
        /**
         * Debug
        */
       
       
       const parameters = {
           materialColor: '#ffeded'
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
      const gradientTexture = textureLoader.load('static/textures/gradients/3.jpg')
      gradientTexture.magFilter = THREE.NearestFilter
      
      // Material
      
        
        
        // Meshes
        const objectsDistance = 4
        const albums = []
        let posY = 0
        let posX = -2
        
        const len = await loginAPI
        let j = 1
        for (let i = 0; i < topTrackImages.length; i++) {
            const texture = textureLoader.load(topTrackImages[i])
            const geo = new THREE.PlaneGeometry(2/3,2/3)
            const mat = new THREE.MeshBasicMaterial({map:texture})
            const mesh = new THREE.Mesh(geo,mat)
            posX++
            mesh.position.x = (posX * 2/3)
            mesh.position.y = posY
            if (j % 3 == 0) {
                posY = posY - 2/3
                posX = -2
            }
            scene.add(mesh)
            albums.push(mesh)
            j++

            
}


const sectionsMeshes = albums

// particles
// part geometries
const particlesCount = 500
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
camera.position.z = 8
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

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()