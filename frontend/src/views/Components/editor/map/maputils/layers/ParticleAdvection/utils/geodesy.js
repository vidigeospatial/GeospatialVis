/*
 * Copyright (c) 2021-2022 WeatherLayers.com
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
// import { distance as geodesyDistance } from 'geodesy-fn/src/spherical.js'

// radius used by deck.gl, see https://github.com/visgl/deck.gl/blob/master/modules/core/src/viewports/globe-viewport.js#L10
export const DEFAULT_RADIUS = 6370972

function toRadians(value) {
    return value / 180 * Math.PI
}

export function distance(start, destination) {

    const R = DEFAULT_RADIUS
    const φ1 = toRadians(start[1]), λ1 = toRadians(start[0])
    const φ2 = toRadians(destination[1]), λ2 = toRadians(destination[0])
    const Δφ = φ2 - φ1
    const Δλ = λ2 - λ1

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c

    return d
    // return geodesyDistance(start, destination, DEFAULT_RADIUS)
}
