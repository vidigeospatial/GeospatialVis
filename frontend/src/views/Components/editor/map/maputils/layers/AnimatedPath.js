import { PathLayer } from '@deck.gl/layers/typed'

class AnimatedPathLayer extends PathLayer {
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
            // spread: {
            //     size: 1,
            //     accessor: 'getSpread',
            // },
            // normals: {
            //     size: 2,
            //     accessor: 'getNorm',
            // }
        })
    }

    // Override the shaders here
    getShaders() {
        return { ...super.getShaders(), inject: {
            'vs:#decl': `
                attribute float startTime;
                attribute float endTime;
                attribute float spread;
                attribute vec2 normals;

                uniform float animationProgress;
                varying float instanceAnimationProgress;
                varying float done;
                // varying float o_x_norm;
                // varying float o_y_norm;
                // varying float o_spread;

                float getInstanceAnimationProgress(float animationProgress){
                    return abs(clamp((animationProgress - startTime) / (endTime - startTime), 0.0, 1.0) * 2. - 1.) * -1. + 1.;
                }

                float getDone(float animationProgress){
                    if (animationProgress > endTime) { return 1.; } else { return 0.; }
                }
                `,

            'vs:#main-end':

                `
                instanceAnimationProgress = getInstanceAnimationProgress(animationProgress);
                done = getDone(animationProgress);
                // o_x_norm = normals.x;
                // o_y_norm = normals.y;
                // o_spread = spread;
                `,
            'fs:#decl': `
                varying float instanceAnimationProgress;
                varying float done;
                // varying float o_x_norm;
                // varying float o_y_norm;
                // varying float o_spread;
                `,
            'fs:#main-end': `
                // gl_FragColor = vec4(gl_FragColor.xyx*instanceAnimationProgress, 1.0);

                vec3 RED = vec3(1,0,0);
                vec3 GREEN = vec3(0,1,0);

                if (done == 1.) {
                // if (o_spread == 0.) {
                    gl_FragColor = vec4(0.8, 0.8, 0.8, 1.);
                    // discard;
                }
                else {
                    // gl_FragColor = vec4(1, 0, 0, instanceAnimationProgress);
                    // gl_FragColor = vec4(o_x_norm/2. + 0.5, (o_y_norm/2. + 0.5), 0, 1.);
                    // gl_FragColor = vec4(clamp(o_spread*8., 0., 1.), 0, 0, instanceAnimationProgress);
                    gl_FragColor = vec4(0.2, 0.2, 0.2, instanceAnimationProgress);
                    // gl_FragColor = vec4(o_x_norm/2. + 0.5, 0, 0, 1.);
                    // gl_FragColor = vec4(mix(RED, GREEN, o_y_norm/2. + 0.5), 1.0);
                    // gl_FragColor = vec4(o_y_norm/2. + 0.5, 0, 0, 1.0);
                    // gl_FragColor = vec4(o_x_norm/2. + 0.5, 0, 0, 1.0);
                    // gl_FragColor = vec4(1.0, 0, 0,o_x_norm/2. + 0.5);
                }
                // gl_FragColor = vec4(0, 0, 0, 1.0);
                // DECKGL_FILTER_COLOR(gl_FragColor, geometry);
                `
        } }
    }

    draw(opts) {
        const { animationProgress = 0.0, animationDuration = 0.0 } = this.props

        const uniforms = { ...opts.uniforms, animationProgress,
            animationDuration, }
        super.draw({ ...opts, uniforms })
    }
}

const defaultProps = {
    // getDelayFactor: { type: 'accessor', value: 0.0 },
}

AnimatedPathLayer.layerName = 'AnimatedPathLayer'
AnimatedPathLayer.defaultProps = {

    ...PathLayer.defaultProps,
    ...defaultProps
}

export { AnimatedPathLayer }
