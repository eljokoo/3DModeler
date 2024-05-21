// Quaternion operations for rotating

// Rotates a vector given rotation quaternion
export function rotateVector(vec, quat) {
    var q = normalize(quat);
    var qv = [0, vec[0], vec[1], vec[2]];
  
    // use rotation operation
    var rotated = multiplyQuaternion(multiplyQuaternion(q, qv), conjugate(q));

    return [rotated[1], rotated[2], rotated[3]];
}
  
// Normalizes a quaternion
function normalize(quat) {
    var magnitude = Math.sqrt(
        quat[0] * quat[0] +
        quat[1] * quat[1] +
        quat[2] * quat[2] +
        quat[3] * quat[3]
    );

    return [
        quat[0] / magnitude,
        quat[1] / magnitude,
        quat[2] / magnitude,
        quat[3] / magnitude
    ];
}
  
// Multiplies two quaternions
function multiplyQuaternion(quat1, quat2) {
    var w1 = quat1[0], x1 = quat1[1], y1 = quat1[2], z1 = quat1[3];
    var w2 = quat2[0], x2 = quat2[1], y2 = quat2[2], z2 = quat2[3];
  
    return [
      w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2,
      w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2,
      w1 * y2 - x1 * z2 + y1 * w2 + z1 * x2,
      w1 * z2 + x1 * y2 - y1 * x2 + z1 * w2
    ];
}
  
// Return conjugate of a quaternion
function conjugate(quat) {
  return [quat[0], -quat[1], -quat[2], -quat[3]];
}

// Makes a quaternion that rotates rx, ry, rz degrees around x first, then y, then z respectively
// inspired by https://math.stackexchange.com/questions/2975109/how-to-convert-euler-angles-to-quaternions-and-get-the-same-euler-angles-back-fr
export function makeQuaternion(rx, ry, rz) {
    var radx = (rx * Math.PI) / 180.0;
    var rady = (ry * Math.PI) / 180.0;
    var radz = (rz * Math.PI) / 180.0;
  
    var cx = Math.cos(radx * 0.5);
    var sx = Math.sin(radx * 0.5);
    var cy = Math.cos(rady * 0.5);
    var sy = Math.sin(rady * 0.5);
    var cz = Math.cos(radz * 0.5);
    var sz = Math.sin(radz * 0.5);
  
    var qw = cx * cy * cz + sx * sy * sz;
    var qx = sx * cy * cz - cx * sy * sz;
    var qy = cx * sy * cz + sx * cy * sz;
    var qz = cx * cy * sz - sx * sy * cz;
  
    return [qw, qx, qy, qz];
  }