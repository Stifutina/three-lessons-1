import Experience from '../Experience.js'
import Environment from './Environment.js'
import Torus from './Torus.js'

export default class TestAnimWorld
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        // Wait for resources
        this.resources.on('ready', () =>
        {
            // Setup
            this.torus = new Torus()
            this.environment = new Environment()
        })
    }

    update()
    {
        if(this.torus)
            this.torus.update()
    }
}