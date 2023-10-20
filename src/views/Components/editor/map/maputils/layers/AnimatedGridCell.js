import { GridCellLayer } from '@deck.gl/layers/typed'

class AnimatedGridCellLayer extends GridCellLayer {
    initializeState() {
        super.initializeState()
        this.getAttributeManager().addInstanced({
            time: {
                size: 1,
                accessor: 'getTime',
            },
            confidence: {
                size: 1,
                accessor: 'getConfidence',
            }
        })
    }

    // Override the shaders here
    getShaders() {
        return { ...super.getShaders(), inject: {
            'vs:#decl': `
                attribute float time;
                attribute float confidence;

                // Should probably scale the elevationScale here
                uniform float animationProgress;
                varying float instanceAnimationProgress;

                float getInstanceAnimationProgress(float animationProgress, float time){
                    float temp = abs(animationProgress - time);
                    // float temp = animationProgress - time;
                    // temp = temp / 0.3;
                    temp = temp / 0.05;
                    temp = 1. - clamp(temp, 0.0, 1.0);
                    return temp;

                    // return abs(clamp((animationProgress - startTime) / (endTime - startTime), 0.0, 1.0) * 2. - 1.) * -1. + 1.;
                }
                `,
            'vs:#main-start':
                `
                instanceAnimationProgress = getInstanceAnimationProgress(animationProgress, time);
                // elevationScale = elevationScale * instanceAnimationProgress;

                `,
            'vs:DECKGL_FILTER_SIZE': `
                size.x *= confidence / 100.;
                size.y *= confidence / 100.;
                `,
            'vs:#main-end': `
                centroidPosition = vec3(instancePositions.xy, instancePositions.z + elevation * instanceAnimationProgress);
                centroidPosition64Low = instancePositions64Low;
                gl_Position = project_position_to_clipspace(centroidPosition, centroidPosition64Low, pos, geometry.position);
                `,
            'fs:#decl': `
                varying float instanceAnimationProgress;
                `,
            'fs:#main-start': `
                if (instanceAnimationProgress == 0.){
                    discard;
                }
                `,
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

AnimatedGridCellLayer.defaultProps = {

    ...GridCellLayer.defaultProps,
    ...defaultProps
}

export { AnimatedGridCellLayer }
