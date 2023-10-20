import { TextLayer } from '@deck.gl/layers'
// Need extension because TextLayer is a composite layer - shaders need to permeate to its sublayers
import { LayerExtension } from '@deck.gl/core'

class AnimationFilter extends LayerExtension {
    getShaders() {
        // return {
        //     inject: {
        //         'vs:#decl': `
        //         attribute float startTime;
        //         attribute float endTime;

        //         // attribute float instanceDelayFactor;
        //         uniform float animationProgress;
        //         varying float instanceAnimationProgress;
        //         varying float done;

        //         float getInstanceAnimationProgress(float animationProgress){
        //             // float delayProportion = 1.0 - pointDuration;
        //             // float delay = instanceDelayFactor * delayProportion;

        //             // return clamp((animationProgress - delay) / pointDuration, 0.0, 1.0);
        //             // return clamp((animationProgress - startTime) / (endTime - startTime), 0.0, 1.0);
        //             return abs(clamp((animationProgress - startTime) / (endTime - startTime), 0.0, 1.0) * 2. - 1.) * -1. + 1.;
        //         }

        //         float getDone(float animationProgress){
        //             if (animationProgress > endTime) { return 1.; } else { return 0.; }
        //         }
        //         `,

        //         'vs:#main-end':

        //         `
        //         instanceAnimationProgress = getInstanceAnimationProgress(animationProgress);
        //         done = getDone(animationProgress);
        //         // instanceAnimationProgress = startTime;
        //         // gl_FragColor = vec4(gl_FragColor.xyx*instanceAnimationProgress, 1.0);
        //         // if (done == 1.) {
        //             // vColor = vec4(0.7, 0.7, 0.7, 0.3);
        //             // discard;
        //         // }
        //         // else {
        //         //     vColor = vec4(1, 0, 0, instanceAnimationProgress);
        //         // }
        //         `,
        //         'fs:#decl': `
        //         varying float instanceAnimationProgress;
        //         varying float done;
        //         `,
        //         'fs:#main-end': `
        //         // gl_FragColor = vec4(gl_FragColor.xyx*instanceAnimationProgress, 1.0);
        //         if (done == 1.) {
        //             gl_FragColor = vec4(0.7, 0.7, 0.7, 1.);
        //             // discard;
        //         }
        //         else {
        //             gl_FragColor = vec4(1, 0, 0, instanceAnimationProgress);
        //         }
        //         // gl_FragColor = vec4(0, 0, 0, 1.0);
        //         // DECKGL_FILTER_COLOR(gl_FragColor, geometry);
        //         `
        //     }
        // }
    }

    updateState(params) {
        const { animationDuration = 0.0 } = params.props
        for (const model of this.getModels()) {
            model.setUniforms({ animationDuration })
        }
    }

    getSubLayerProps(params) {
        return {
            animationDuration: 0.0,
            getStartTime: { type: 'accessor', value: 0 },
            getEndTime: { type: 'accessor', value: 0 }
        }
    }
}

class AnimatedTextIconLayer extends TextLayer {
    initializeState() {
        super.initializeState()
        // this.getAttributeManager().addInstanced({
        //     instanceDelayFactor: {
        //         size: 1,
        //         accessor: 'getDelayFactor',
        //     },
        // });
        // this.getAttributeManager().addInstanced({
        //     startTime: {
        //         size: 1,
        //         accessor: 'getStartTime',
        //     },
        //     endTime: {
        //         size: 1,
        //         accessor: 'getEndTime',
        //     },
        // });
    }

    // draw(opts) {
    //     const { animationProgress = 0.0 } = this.props;

    //     const uniforms = {
    //         ...opts.uniforms,
    //         animationProgress,
    //     };
    //     super.draw({
    //         ...opts,
    //         ...uniforms
    //     });
    // }
}

const defaultProps = {
    getDelayFactor: { type: 'accessor', value: 0.0 },
}

AnimatedTextIconLayer.defaultProps = {
    ...TextLayer.defaultProps,
    defaultProps
}

export { AnimatedTextIconLayer, AnimationFilter }
