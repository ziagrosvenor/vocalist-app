

export const mixer = (ctx, config, input1, input2) => {
  const input1Gain = ctx.createGain()
  const input2Gain = ctx.createGain()
  const output = ctx.createGain()

  input1.connect(input1Gain)
  input2.connect(input2Gain)

  var x = parseInt(config.value) / parseInt(config.max);
  // Use an equal-power crossfading curve:
  input1Gain.gain.value = Math.cos(x * 0.5*Math.PI);
  input2Gain.gain.value = Math.cos((1.0 - x) * 0.5*Math.PI);

  input1Gain.connect(output)
  input2Gain.connect(output)

  return {
    node: output,
    updateMix(value) {
      var x = parseInt(value) / parseInt(config.max);
      // Use an equal-power crossfading curve:
      input1Gain.gain.value = Math.cos(x * 0.5*Math.PI);
      input2Gain.gain.value = Math.cos((1.0 - x) * 0.5*Math.PI);
    }
  }
}
