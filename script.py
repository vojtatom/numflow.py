from numflow.application import Application
app = Application()
#app.load_dataset("test2.csv")
#faster loading
app.load_dataset("el1.fits")
#app.load_dataset("mag1_512_512_512.csv")
app.add_glyphs(numSamples=10000)
app.add_slice(0, axis="z", resolution=[1000, 1000])
app.add_slice(0, axis="x", resolution=[1000, 1000])
#app.add_slice(15, axis="z")
#app.add_streamline(0, 0.1, numSamples=1000, low=[-10, -10, 15], high=[10, 10, 15])
app.add_streamline(0, 100, numSamples=100)
app.run()