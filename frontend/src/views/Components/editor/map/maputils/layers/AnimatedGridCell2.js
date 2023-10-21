import { GridCellLayer } from '@deck.gl/layers/typed'

class AnimatedGridCellLayer extends GridCellLayer {
    initializeState() {
        super.initializeState()
        this.getAttributeManager().addInstanced({
            instanceElevations: {
                size: 1,
                update:this.updateElevations
            }
        })
    }

    // updateElevations(attribute) {
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

AnimatedGridCellLayer.defaultProps = {

    ...GridCellLayer.defaultProps,
    ...defaultProps
}

export { AnimatedGridCellLayer }
