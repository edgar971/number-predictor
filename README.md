# Image Recognition using Tensorflow.js
A simple number predictor demo built using a Tensorflow.js model trained on the MNIST dataset. 

### Pre-trained Model
 The pre-trained model used by default was trained locally on a Mac machine using Keras and then converted to a Tensorflow.js format.

### Browser Trained Model
The local model is trained locally in-browser using Tensorflow.js.

## Model Architecture
A Convolutional Neural Network (CNN) with 5 layers, 1 input 3 hidden and 1 for output. See code for more on activation function and other info on the model.

## General Architecture
1. Load the MNIST dataset if training the model in the browser.
1. Load the pre-trained model or the browser trained model. 
1. Take the input from the canvas element and do some processing to the pixels. 
1. Take the input and run it throw the trained model. 
1. Take the predictions and determine which one has the higher probability. 
1. Display the highest predicted number.