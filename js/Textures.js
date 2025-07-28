// js/Textures.js
const Textures = {
    cache: {},
    basePath: 'res/ZT/', // <-- Обновленный путь

    loadTexture: function (path) {
        // Убираем ведущий слэш из пути, если он есть
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        const fullPath = this.basePath + cleanPath;

        if (this.cache[fullPath]) {
            return this.cache[fullPath];
        }

        const texture = new THREE.TextureLoader().load(fullPath);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        // Optional: Set texture wrapping if needed
        // texture.wrapS = THREE.RepeatWrapping;
        // texture.wrapT = THREE.RepeatWrapping;
        this.cache[fullPath] = texture;
        return texture;
    }
};
        this.leg1.material.color.setHex(color);
    }
}