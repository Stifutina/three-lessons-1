import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Torus
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug

        // Debug
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Torus')
        }

        // Resource
        this.resource = this.resources.items.torusModel

        this.setModel()
        this.setAnimation()
    }

    setModel()
    {
        this.model = this.resource.scene
        this.model.scale.set(1, 1, 1)
        this.scene.add(this.model)

        this.model.traverse((child) =>
        {
            if(child instanceof THREE.Mesh)
            {
                child.castShadow = true
            }
        })
    }

    setAnimation()
    {
        this.animation = {}
        
        // Mixer
        this.animation.mixer = new THREE.AnimationMixer(this.model)
        
        // Actions
        this.animation.actions = {}
        
        this.animation.actions.default = this.animation.mixer.clipAction(this.resource.animations[0]);
        this.animation.actions.default.loop = THREE.LoopRepeat
        
        this.animation.actions.current = this.animation.actions.default
        this.animation.actions.current.play()

        // Animation mode
        this.animation.mode = 'restart' // 'restart' or 'alternate'
        this.animation.direction = 1 // 1 for forward, -1 for backward
        this.animation.lastTime = 0

        // Play the action
        this.animation.play = (name) =>
        {
            const newAction = this.animation.actions[name]
            const oldAction = this.animation.actions.current

            newAction.reset()
            newAction.play()
            newAction.crossFadeFrom(oldAction, 1)

            this.animation.actions.current = newAction;
            this.animation.direction = 1
            
            this.animation.lastTime = 0
        }

        console.log('this.animation', this.animation);

        // Debug
        if(this.debug.active)
        {
            const debugObject = {
                playDefault: () => { this.animation.play('default') },
                play: () => { this.animation.actions.current.paused = false },
                pause: () => { this.animation.actions.current.paused = true },
                restart: () => {
                    this.animation.actions.current.reset()
                    this.animation.actions.current.timeScale = 1
                    this.animation.actions.current.play()
                },
                mode: 'restart'
            }
            this.debugFolder.add(debugObject, 'playDefault')
            this.debugFolder.add(debugObject, 'play')
            this.debugFolder.add(debugObject, 'pause')
            this.debugFolder.add(debugObject, 'restart')
            this.debugFolder.add(debugObject, 'mode', ['restart', 'alternate']).onChange((value) => {
                this.animation.mode = value
                
                if(value === 'restart')
                {
                    this.animation.actions.current.loop = THREE.LoopRepeat
                }
                else if(value === 'alternate')
                {
                    this.animation.actions.current.loop = THREE.LoopPingPong
                }
                
                this.animation.actions.current.timeScale = 1
                this.animation.direction = 1
                this.animation.lastTime = 0
            })
        }
    }

    update()
    {
        this.animation.mixer.update(this.time.delta * 0.001)
    }
}