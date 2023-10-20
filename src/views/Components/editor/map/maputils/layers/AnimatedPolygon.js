import { SolidPolygonLayer } from '@deck.gl/layers'

class AnimatedPolygonLayer extends SolidPolygonLayer {
    initializeState() {
        super.initializeState()
        this.getAttributeManager().addInstanced({
            startTime: {
                size: 1,
                accessor: 'getStartTime',
            },
            endTime: {
                size: 1,
                accessor: 'getEndTime',
            },
        })
    }

    // Override the shaders here
    getShaders(opts) {
        return { ...super.getShaders(opts), inject: {
            'vs:#decl': `
                attribute float startTime;
                attribute float endTime;

                uniform float animationProgress;
                uniform float animationDuration;

                varying float instanceAnimationProgress;

                float getInstanceAnimationProgress(float instanceDelayFactor, float animationProgress, float animationDuration){
                    float delayProportion = 1.0 - animationDuration;
                    float actualStartTime = instanceDelayFactor * delayProportion;

                    return clamp((animationProgress - startTime) / (endTime - startTime), 0.0, 1.0);
                }
                `,

            'vs:#main-end':
                `
                // instanceAnimationProgress = getInstanceAnimationProgress(startTime, animationProgress, animationDuration);
                instanceAnimationProgress = startTime;
                `,
            'fs:#decl': `
                varying float instanceAnimationProgress;
                `,
            'fs:#main-end': `
                // gl_FragColor = vec4(gl_FragColor.xyx*instanceAnimationProgress, 1.0);
                gl_FragColor = vec4(1,0,0, instanceAnimationProgress);
                // gl_FragColor = vec4(instanceDelayFactor2, instanceDelayFactor2, instanceDelayFactor2, 1.0);
                // gl_FragColor = vec4(0, 0, 0, 1.0);
                `
        } }
    }

    draw(opts) {
        const { animationProgress = 0.0, animationDuration = 0.0 } = this.props
        // console.log('sdfs', animationProgress);

        const uniforms = { ...opts.uniforms, animationProgress,
            animationDuration, }
        super.draw({ ...opts, uniforms })
    }
}

const defaultProps = {
    getStartTime: { type: 'accessor', value: 0.0 },
    getEndTime: { type: 'accessor', value: 0.0 },
}

AnimatedPolygonLayer.defaultProps = {
    
    ...SolidPolygonLayer.defaultProps,
    ...defaultProps
}

export { AnimatedPolygonLayer }
