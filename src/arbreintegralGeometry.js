/**
 * Concert the 'circle position' of a leaf to its cartesian coordinates
 * @param {Object} origin - Cartesian coordinates of the center
 * @param {number} origin.x - absciss
 * @param {number} origin.y - ordinate
 * @param {number} circleRadius - radius of the largest circle 
 * @param {Object} position - position of the leaf in regard to the circles
 * @param {number} position.circ - n° of the circle
 * @param {number} position.pos - position in that circle 
 * @return {Object} - {absciss, ordinate} 
 */
export function circToCartesian (origin, circleRadius, {circ, pos}){
   if (circ < 1){
     return origin;
   }

   const nbLeafs = Math.pow(2, circ);
   const angleIncrement = Math.PI / (nbLeafs/2 + 1);

   let deviation = angleIncrement * 0.5;
   let angle = Math.PI + deviation - pos * angleIncrement;
   if (pos > nbLeafs/2) {
     angle -= angleIncrement ; 
   }
   const radial = circleRadius * circ; 
   return {
     x: origin.x + radial * Math.cos(angle),
     y: origin.y - radial * Math.sin(angle)
   };
 }

 /**
  * Cartesian to polar coordinates converter
  * @param {Object} pos - cartesian coordinates
  * @param {number} pos.x - absciss
  * @param {number} pos.y - ordinate
  * @return {Object} - polar coordinates
  */
export function  cartesianToPolar(pos){
    const r = Math.sqrt(Math.pow(pos.x, 2) + Math.pow(pos.y, 2)); 
    const angle = 2 * Math.atan(pos.y/(pos.x + r));
    return {r, angle};
  }

export function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }
