export function getUserMedia(options) {
  let getUserMediaP

  if (navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    getUserMediaP = navigator.mediaDevices.getUserMedia(options)
  } else {
    getUserMediaP = new Promise((resolve, reject) => (
      navigator.getUserMedia(options, resolve, reject)
    ))
  }

  return getUserMediaP
}
