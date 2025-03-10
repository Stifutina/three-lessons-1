export default [
    {
        name: 'environmentMapTexture',
        type: 'cubeTexture',
        path:
        [
            '/environmentMaps/cube/px.jpg',
            '/environmentMaps/cube/nx.jpg',
            '/environmentMaps/cube/py.jpg',
            '/environmentMaps/cube/ny.jpg',
            '/environmentMaps/cube/pz.jpg',
            '/environmentMaps/cube/nz.jpg'
        ]
    },
    {
        name: 'grassColorTexture',
        type: 'texture',
        path: '/textures/dirt/color.jpg'
    },
    {
        name: 'grassNormalTexture',
        type: 'texture',
        path: '/textures/dirt/normal.jpg'
    },
    {
        name: 'foxModel',
        type: 'gltfModel',
        path: '/models/Fox/glTF/Fox.gltf'
    }
]