# Micro-Bookstore: A Practical Example of Microservices

This repository contains a simple example of a virtual bookstore built
using a **microservices architecture**.

The example was designed to be used in a **hands-on class about
microservices**, which can, for example, take place after studying
[Chapter 7](https://softengbook.org/chapter7) of the book
[Software Engineering: A Modern Approach](https://softengbook.org).

The goal of the class is to give students a first contact with
microservices and with technologies commonly used in this type of
architecture, such as Node.js, REST, gRPC, and Docker.

Since our goal is educational, the virtual bookstore offers only three
books for sale, as shown in the figure below, which illustrates the
system’s web interface. Furthermore, the purchase operation only
simulates the user’s action and does not update the stock. Thus,
bookstore clients can perform only two operations: (1) list products
for sale; (2) calculate shipping costs.

<p align="center">
    <img width="70%" src="https://user-images.githubusercontent.com/7620947/108773349-f68f3500-753c-11eb-8c4f-434ca9a9deec.png" />
</p>

In the rest of this document we will:

* Describe the system, focusing on its architecture.
* Provide instructions to run it locally using the code available in
  this repository.
* Describe two practical tasks for students:

  * Practical Task #1: Implement a new operation in one of the
    microservices.
  * Practical Task #2: Create Docker containers to facilitate running
    the microservices.

## Architecture

The micro-bookstore has four microservices:

* Front-end: responsible for the user interface, as shown in the figure above.
* Controller: responsible for mediating communication between the front-end and the backend.
* Shipping: responsible for calculating shipping costs.
* Inventory: responsible for managing the bookstore’s stock.

All four microservices are implemented in JavaScript, using Node.js for
backend execution.

However, **you will be able to complete the practical tasks even if you
have never programmed in JavaScript**, because our guide already
includes the code snippets you need to copy into the system.

To simplify execution and understanding, no databases or external
services are used.

## Communication Protocols

As illustrated in the diagram below, communication between the front-end
and the backend uses a REST API, which is common for web systems.

Communication between the Controller and the backend microservices,
however, is based on [gRPC](https://grpc.io/).

<p align="center">
    <img width="70%" src="https://user-images.githubusercontent.com/7620947/108454750-bc2b4c80-724b-11eb-82e5-717b8b5c5a88.png" />
</p>

We chose gRPC for the backend because it performs better than REST.
Specifically, gRPC is based on the concept of Remote Procedure Call
(RPC). The idea is simple: in distributed applications using gRPC, a
client can call functions implemented in other processes transparently,
as if those functions were local. In other words, gRPC calls have the
same syntax as normal function calls.

To achieve this transparency, gRPC relies on two key concepts:

* a language for interface definition
* a protocol for exchanging messages between client and server applications

In gRPC, the implementation of these concepts is called **Protocol
Buffer**, which can be summarized as:

> Protocol Buffer = interface definition language + protocol for defining messages exchanged between client and server applications

### Example of a .proto File

With gRPC, each microservice has a `.proto` file that defines the
signatures of the operations it provides to other microservices. This
file also declares the types of the input and output parameters.

The following example shows the 
[.proto](https://github.com/aserg-ufmg/micro-bookstore/blob/main/proto/shipping.proto)
file for our shipping microservice. It defines a function
`GetShippingRate`. To call this function, we must provide an object
containing the ZIP code (`ShippingPayLoad`) as input. The function then
returns a `ShippingResponse` object with the shipping cost.

<p align="center">
    <img width="70%" src="https://user-images.githubusercontent.com/7620947/108770189-c776c480-7538-11eb-850a-f8a23f562fa5.png" />
</p>

In gRPC, messages (e.g., `Shippingload`) are composed of fields, similar to a `struct` in C. Each field has a name (e.g., `cep`) and a type (e.g., `string`), as well as an integer identifier (e.g., `= 1`) used in the binary format of gRPC messages.

.proto files are used to generate **stubs**, which are proxies encapsulating the details of network communication. More on the Proxy design pattern can be found in [Chapter 6](https://engsoftmoderna.info/cap6.html).

In static languages, a compiler is usually required to generate stub code. In JavaScript, however, this is done transparently at runtime.

## Running the System

The following steps describe how to run the system locally (all microservices will run on your machine):

1. Fork the repository by clicking the **Fork** button in the upper right corner of this page.

2. Clone the project in your terminal (remember to add your GitHub username to the URL):

   ```
   git clone https://github.com/<YOUR USERNAME>/micro-livraria.git
   ```

3. Install [Node.js](https://nodejs.org/en/download/) if it is not already installed.

4. In the project directory, install the dependencies:

   ```
   cd micro-livraria
   npm install
   ```

5. Start the microservices:

   ```
   npm run start
   ```

6. Test the backend API:

   ```
   curl -i -X GET http://localhost:3000/products
   ```

   Or visit `http://localhost:3000/products` in your browser.

7. Open the front-end in a browser at [http://localhost:5000](http://localhost:5000) and test the bookstore’s features.

## Practical Task #1: Implementing a New Operation

In this task, you will implement a new operation in the `Inventory` service called `SearchProductByID`, which searches for a product by its ID.

Steps include:

* Declaring the function signature in `proto/inventory.proto`.
* Adding a `Payload` message containing the product ID.
* Implementing the function in [services/inventory/index.js](https://github.com/aserg-ufmg/micro-livraria/blob/main/services/inventory/index.js).
* Updating the Controller to add a new route `/product/:id`.

Finally, test the new API endpoint at: `http://localhost:3000/product/1`.

(Commit & Push instructions are also provided.)

## Practical Task #2: Creating a Docker Container

In this task, you will create a Docker container for the `Shipping` microservice.

Steps include:

* Writing a `shipping.Dockerfile` to build an image.
* Running `docker build` to generate the image.
* Updating `package.json` to exclude `start-shipping` from `npm run start`.
* Running the container with `docker run -ti --name shipping -p 3001:3001 micro-livraria/shipping`.

After verifying functionality, you can stop, remove the container, and remove the image using `docker stop`, `docker rm`, and `docker rmi`.

## Final Remarks

This exercise demonstrated a small microservice-based application. While simplified, it illustrates core principles of microservices and some key technologies.

Real-world applications, however, include additional components such as databases, load balancers, and orchestrators like [Kubernetes](https://kubernetes.io/).

## Credits

This practical exercise, including its code, was developed by **Rodrigo Brito**, Master’s student at DCC/UFMG, as part of the **Teaching Internship** course in 2020/2, supervised by **Prof. Marco Tulio Valente**.

The repository code is licensed under MIT. The guide above is licensed under CC-BY.

