import { HeatmapLayer } from '@deck.gl/aggregation-layers/typed'

class AnimatedHeatmapLayer extends HeatmapLayer {
    initializeState() {
        super.initializeState()
        this.getAttributeManager().addInstanced({
            // time: {
            //     size: 1,
            //     accessor: 'getTime',
            // },
            // endTime: {
            //     size: 1,
            //     accessor: 'getEndTime',
            // },
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
    // getShaders() {
    //    return Object.assign({}, super.getShaders(), {
    //        inject: {
    //            'vs:#decl': `
    //            attribute float time;
    //            attribute float spread;
    //            attribute vec2 normals;

    //            // Should probably scale the elevationScale here
    //            uniform float animationProgress;
    //            varying float instanceAnimationProgress;
    //            varying float instanceElevations;
    //            varying float done;

    //            float getInstanceAnimationProgress(float animationProgress, float time){
    //                float temp = abs(animationProgress - time);
    //                temp = temp / 0.05;
    //                temp = 1. - clamp(temp, 0.0, 1.0);
    //                return temp;

    //                // return abs(clamp((animationProgress - startTime) / (endTime - startTime), 0.0, 1.0) * 2. - 1.) * -1. + 1.;
    //            }

    //            //float getDone(float animationProgress){
    //            //    //if (animationProgress > endTime) { return 1.; } else { return 0.; }
    //            //    if (animationProgress == 0) { return 1.; } else { return 0.; }

    //            //}
    //            `,
    //            'vs:#main-start':
    //            `
    //            instanceAnimationProgress = getInstanceAnimationProgress(animationProgress, time);
    //            //spread = instanceElevations * instanceAnimationProgress;

    //            `,

    //            'fs:#decl': `
    //            varying float instanceAnimationProgress;
    //            varying float done;
    //            // varying float o_x_norm;
    //            // varying float o_y_norm;
    //            // varying float o_spread;
    //            `,
    //            'fs:#main-end': `
    //            // gl_FragColor = vec4(gl_FragColor.xyx*instanceAnimationProgress, 1.0);

    //            // vec3 RED = vec3(1,0,0);
    //            // vec3 GREEN = vec3(0,1,0);

    //            if (done == 1.) {
    //            // if (o_spread == 0.) {
    //                // gl_FragColor = vec4(0.2, 0.2, 0.2, 1.);
    //                // discard;
    //            }
    //            else {
    //                // gl_FragColor = vec4(1, 0, 0, instanceAnimationProgress);
    //                // gl_FragColor = vec4(o_x_norm/2. + 0.5, (o_y_norm/2. + 0.5), 0, 1.);
    //                // gl_FragColor = vec4(clamp(o_spread*8., 0., 1.), 0, 0, instanceAnimationProgress);
    //                // gl_FragColor = vec4(0.7, 0.7, 0.7, instanceAnimationProgress);
    //                // gl_FragColor = vec4(o_x_norm/2. + 0.5, 0, 0, 1.);
    //                // gl_FragColor = vec4(mix(RED, GREEN, o_y_norm/2. + 0.5), 1.0);
    //                // gl_FragColor = vec4(o_y_norm/2. + 0.5, 0, 0, 1.0);
    //                // gl_FragColor = vec4(o_x_norm/2. + 0.5, 0, 0, 1.0);
    //                // gl_FragColor = vec4(1.0, 0, 0,o_x_norm/2. + 0.5);
    //            }
    //            // gl_FragColor = vec4(0, 0, 0, 1.0);
    //            // DECKGL_FILTER_COLOR(gl_FragColor, geometry);
    //            `
    //        }
    //    });
    // }

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

AnimatedHeatmapLayer.defaultProps = {

    ...HeatmapLayer.defaultProps,
    ...defaultProps
}

export { AnimatedHeatmapLayer }
