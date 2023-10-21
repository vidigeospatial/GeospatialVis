import { IconLayer } from '@deck.gl/layers/typed'

class DraggableIconLayer extends IconLayer {
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
    updateState({ props, oldProps, changeFlags }) {
        super.updateState({ props, oldProps, changeFlags })
    }

    draw(opts) {
        super.draw({ ...opts })
    }
}

const defaultProps = {
    // Disable dragging on the base deckgl for the draggable icon layer

}

DraggableIconLayer.defaultProps = {

    ...IconLayer.defaultProps,
    ...defaultProps
}

export { DraggableIconLayer }
