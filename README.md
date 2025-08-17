# Micro-Bookstore: A Practical Example of Microservices

This repository contains a simple example of a virtual bookstore
implemented using a **microservices architecture**. The example was
designed for use in a hands-on class about microservices, which can,
for example, take place after studying
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
for sale and (2) calculate shipping costs.

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

* **Front-end:** responsible for the user interface, as shown in the figure above.
* **Controller:** responsible for mediating communication between the front-end and the back-end.
* **Shipping:** responsible for calculating shipping costs.
* **Inventory:** responsible for managing the bookstore’s stock.

All four microservices are implemented in JavaScript, using Node.js for
back-end execution.

However, you will be able to complete the practical tasks even if you
have never programmed in JavaScript, because our guide already
includes the code snippets you need to copy into the system.

To simplify execution and understanding, no databases or external
services are used.

## Communication Protocols

As illustrated in the diagram below, communication between the front-end
and the back-end uses a REST API, which is common for web systems.

Communication between the Controller and the back-end microservices,
however, is based on [gRPC](https://grpc.io/).

<p align="center">
    <img width="70%" src="https://user-images.githubusercontent.com/7620947/108454750-bc2b4c80-724b-11eb-82e5-717b8b5c5a88.png" />
</p>

We chose gRPC for the back-end because it performs better than REST.
Specifically, gRPC is based on the concept of Remote Procedure Call
(RPC). The idea is simple: in distributed applications using gRPC, a
client can call functions implemented in other processes transparently,
as if those functions were local. In other words, gRPC calls have the
same syntax as normal function calls.

To achieve this transparency, gRPC relies on two key concepts:

* A language for interface definition
* A protocol for exchanging messages between client and server applications

In gRPC, the implementation of these concepts is called **Protocol
Buffer**, which can be summarized as:

> Protocol Buffer = interface definition language + protocol for exchanging messages between client and server applications

### Example of a .proto File

With gRPC, each microservice has a `.proto` file that defines the
signatures of the operations it provides to other microservices. This
file also declares the types of the input and output parameters.

The following example shows the 
[.proto](https://github.com/aserg-ufmg/micro-bookstore/blob/main/proto/shipping.proto)
file for our shipping microservice. It defines a function called
`GetShippingRate`. To call this function, we must provide an object
containing the ZIP code (`ShippingPayLoad`) as input. The function then
returns a `ShippingResponse` object with the shipping cost.

<p align="center">
    <img width="70%" src="https://user-images.githubusercontent.com/7620947/108770189-c776c480-7538-11eb-850a-f8a23f562fa5.png" />
</p>

In gRPC, messages (e.g., `Shippingload`) are composed of fields, similar
to a `struct` in C. Each field has a name (e.g., `cep`) and a type
(e.g., `string`), as well as an integer identifier (e.g., `= 1`) used
in the binary format of gRPC messages.

.proto files are used to generate **stubs**, which are proxies
that encapsulate the details of network communication. More on the Proxy
design pattern can be found in 
[Chapter 6](https://softengbook.org/chapter6).

In static languages, a compiler is usually required to generate stub
code. In JavaScript, however, this is done transparently at runtime.


## Running the System

The following steps describe how to run the system locally
(all microservices will run on your machine):

1. Fork the repository by clicking the **Fork** button in the upper
right corner of this page.

2. Clone the project in your terminal (remember to add your GitHub
username to the URL):

   ```
   git clone https://github.com/<YOUR USERNAME>/micro-bookstore.git
   ```

3. Install [Node.js](https://nodejs.org/en/download/) if it is not already installed.

4. In the project directory, install the dependencies:

   ```
   cd micro-bookstore
   npm install
   ```

5. Start the microservices:

   ```
   npm run start
   ```

6. Test the back-end API:

   ```
   curl -i -X GET http://localhost:3000/products
   ```

   Or visit `http://localhost:3000/products` in your browser.

7. Open the front-end in a browser at [http://localhost:5000]
(http://localhost:5000) and test the bookstore’s features.



## Practical Task #1: Implementing a New Operation

In this first task, you will implement a new operation in the `Inventory` service. This operation, called `SearchProductByID`, will search for a product given its ID.

As previously described, the operation signatures of each microservice are defined in a `.proto` file, in this case [proto/inventory.proto](https://github.com/aserg-ufmg/micro-bookstore
/blob/main/proto/inventory.proto).

#### Step 1

First, you must declare the signature of the new operation. To do this, include the definition of this signature in the `.proto` file (right after the signature of the `SearchAllProducts` function):

```proto
service InventoryService {
    rpc SearchAllProducts(Empty) returns (ProductsResponse) {}
    rpc SearchProductByID(Payload) returns (ProductResponse) {}
}
```

In other words, you are defining that the `Inventory` microservice will respond to a new request, called `SearchProductByID`, which has as input parameter an object of type `Payload` and as output parameter an object of type `ProductResponse`.

#### Step 2

Also include in the same file the declaration of the `Payload` object type, which only contains the ID of the product to be searched.

```proto
message Payload {
    int32 id = 1;
}
```

Notice that `ProductResponse`—that is, the return type of the operation—has already been declared further down in the proto file:

```proto
message ProductsResponse {
    repeated ProductResponse products = 1;
}
```

So, the response to our request will contain a single field of type `ProductResponse`, which is also already implemented in the same file:

```proto
message ProductResponse {
    int32 id = 1;
    string name = 2;
    int32 quantity = 3;
    float price = 4;
    string photo = 5;
    string author = 6;
}
```

#### Step 3

Now you must implement the `SearchProductByID` function in the file [services/inventory/index.js](https://github.com/aserg-ufmg/micro-bookstore/blob/main/services/inventory/index.js).

To reinforce: in the previous step, we only declared the function signature. Now we will provide an implementation for it.

To do this, you need to implement the function required by the second parameter of the `server.addService` function, located on line 17 of the file [services/inventory/index.js](https://github.com/aserg-ufmg/micro-bookstore/blob/main/services/inventory/index.js).

Similarly to the `SearchAllProducts` function, which is already implemented, you must add the body of the `SearchProductByID` function with the logic for searching products by ID. This code should be added right after `SearchAllProducts` on line 23.

```js
    SearchProductByID: (payload, callback) => {
        callback(
            null,
            products.find((product) => product.id == payload.request.id)
        );
    },
```

The function above uses the `find` method to search `products` for the given product ID. Note that:

* `payload` is the input parameter of our service, as defined earlier in the .proto file (step 2). It stores the ID of the product we want to search. To access this ID, simply write `payload.request.id`.
* `product` is a product unit to be searched by the native JavaScript `find` function. This search is performed across all items in the product list until the first `product` matches the search condition, i.e., `product.id == payload.request.id`.
* [products](https://github.com/aserg-ufmg/micro-bookstore/blob/main/services/inventory/products.json) is a JSON file containing the description of the books for sale in the bookstore.
* `callback` is a function that must be invoked with two parameters:

  * The first parameter is an error object, if one occurs. In our example, no error is returned, so it is `null`.
  * The second parameter is the function result, in our case a `ProductResponse`, as defined in the [proto/inventory.proto](https://github.com/aserg-ufmg/micro-bookstore/blob/main/proto/inventory.proto) file.

#### Step 4

Finally, we need to include the `SearchProductByID` function in our `Controller`. To do this, you must add a new `/product/{id}` route that will receive the product ID as a parameter. In the route definition, you must also include the call to the method defined in Step 3.

Specifically, the following code snippet should be added on line 44 of the file [services/controller/index.js](https://github.com/aserg-ufmg/micro-bookstore/blob/main/services/controller/index.js), right after the `/shipping/:cep` route.

```js
app.get('/product/:id', (req, res, next) => {
    // Calls microservice method.
    inventory.SearchProductByID({ id: req.params.id }, (err, product) => {
        // If a communication error occurs
        // with the microservice, return it to the browser.
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'something failed :(' });
        } else {
            // Otherwise, return the result from the
            // microservice (a JSON file) with the data
            // of the searched product
            res.json(product);
        }
    });
});
```

To finish, make a call to the new API endpoint: [http://localhost:3000/product/1](http://localhost:3000/product/1)

To be clear: up to this point, we have only implemented the new operation in the backend. Its incorporation into the frontend is pending, as it requires changes to the Web interface, such as adding a "Search Book" button.

**IMPORTANT**: If everything worked correctly, perform a **COMMIT & PUSH** (and make sure your GitHub repository is updated; this is essential for your work to be properly graded).

```bash
git add --all
git commit -m "Practical task #1 - Microservices"
git push origin main
```

---

## Practical Task #2: Creating a Docker Container

In this second task, you will create a Docker container for your microservice. Containers are important for isolating and distributing microservices in production environments. In other words, once "copied" to a container, a microservice can run in any environment, whether it is your local machine, your university server, or a cloud system (such as Amazon AWS, Google Cloud, etc).

Since our first goal is didactic, we will create only one Docker image to illustrate the use of containers.

If you do not have Docker installed on your machine, you must install it before starting the task. A step-by-step installation guide can be found in the [official documentation](https://docs.docker.com/get-docker/).

#### Step 1

Create a file at the root of the project named `shipping.Dockerfile`. This file will store the instructions for creating a Docker image for the `Shipping` service.

As illustrated in the following figure, the Dockerfile is used to generate an image. From this image, you can create multiple instances of an application. This way, we can scale the `Shipping` microservice horizontally.

<p align="center">
    <img width="70%" src="https://user-images.githubusercontent.com/7620947/108651385-67ccda80-74a0-11eb-9390-80df6ea6fd8c.png" />
</p>

In the Dockerfile, you need to include five instructions:

* `FROM`: the base technology for creating the image.
* `WORKDIR`: the image directory where commands will be executed.
* `COPY`: command to copy the source code into the image.
* `RUN`: command to install dependencies.
* `CMD`: command to run your code when the container is created.

So, our Dockerfile will have the following lines:

```Dockerfile
# Base image derived from Node
FROM node

# Working directory
WORKDIR /app

# Command to copy the files to the /app folder of the image
COPY . /app

# Command to install dependencies
RUN npm install

# Command to start (run) the application
CMD ["node", "/app/services/shipping/index.js"]
```

#### Step 2

Now we will compile the Dockerfile and create the image. To do this, run the following command in a terminal (this command must be run from the project root; it may also take a little longer to execute):

```
docker build -t micro-bookstore/shipping -f shipping.Dockerfile ./
```

where:

* `docker build`: Docker build command.
* `-t micro-bookstore/shipping`: tag to identify the created image.
* `-f shipping.Dockerfile`: dockerfile to be compiled.

The `./` at the end indicates that we are executing the Dockerfile commands from the project root.

#### Step 3

Before starting the service via Docker container, we need to remove the initialization of the Shipping service from the `npm run start` command. To do this, just remove the `start-shipping` subcommand located on line 7 of the [package.json](https://github.com/aserg-ufmg/micro-bookstore
/blob/main/package.json) file, as shown in the diff below (the line with a "-" symbol at the beginning represents the original file line; the line with a "+" symbol represents how the line should look after the change):

```diff
diff --git a/package.json b/package.json
index 25ff65c..552a04e 100644
--- a/package.json
+++ b/package.json
@@ -4,7 +4,7 @@
     "description": "Toy example of microservice",
     "main": "",
     "scripts": {
-        "start": "run-p start-frontend start-controller start-shipping start-inventory",
+        "start": "run-p start-frontend start-controller start-inventory",
         "start-controller": "nodemon services/controller/index.js",
         "start-shipping": "nodemon services/shipping/index.js",
         "start-inventory": "nodemon services/inventory/index.js",
```

Then, stop the old command (just press CTRL-C in the terminal) and run `npm run start` to apply the changes.

Finally, to run the image created in the previous step (i.e., put the `Shipping` microservice back online), simply use the following command:

```
docker run -ti --name shipping -p 3001:3001 micro-bookstore/shipping
```

where:

* `docker run`: command to run a Docker image.
* `-ti`: enables interaction with the container via terminal.
* `--name shipping`: defines the name of the created container.
* `-p 3001:3001`: maps port 3001 of the container to your machine.
* `micro-bookstore/shipping`: specifies which image to run.

If everything is correct, you will receive the following message in your terminal:

```
Shipping Service running
```

And the Controller can access the service directly through the Docker container.

**But what exactly is the advantage of creating this container?** Now, you can take it to any machine or operating system and run the microservice without installing anything else (including libraries, external dependencies, runtime modules, etc.). This works for containers implemented in JavaScript, as in our example, but also for containers implemented in any other language.

**IMPORTANT**: If everything worked correctly, perform a **COMMIT & PUSH** (and make sure your GitHub repository is updated; this is essential for your work to be properly graded).

```bash
git add --all
git commit -m "Practical task #2 - Docker"
git push origin main
```

#### Step 4

Since everything worked correctly, we can now stop the container and clean our environment. For this, we use the following commands:

```
docker stop shipping
```

where:

* `docker stop`: command to stop the execution of a container.
* `shipping`: name of the container to be stopped.

```
docker rm shipping
```

where:

* `docker rm`: command to remove a container.
* `shipping`: name of the container to be removed.

```
docker rmi micro-bookstore/shipping
```

where:

* `docker rmi`: command to remove an image.
* `micro-bookstore/shipping`: name of the image to be removed.

---

## Final Remarks

In this class, we worked on a microservices-based application. Although small, it illustrates the basic principles of microservices as well as some important technologies when implementing this type of architecture.

However, it is important to highlight that in a real application there are other components, such as databases, load balancers, and orchestrators.

The role of a **load balancer** is to distribute requests when we have more than one instance of the same microservice. Imagine that the shipping microservice of the online store became overloaded, and we had to run multiple instances of it. In this case, we need a load balancer to distribute incoming requests among these instances.

An **orchestrator**, on the other hand, manages the lifecycle of containers. For example, if a server goes down, it automatically moves its containers to another server. If the number of accesses to the system suddenly increases, an orchestrator also increases the number of containers accordingly. [Kubernetes](https://kubernetes.io/) is one of the most widely used orchestrators today.

If you want to study a second microservices demo system, we suggest this [repository](https://github.com/GoogleCloudPlatform/microservices-demo), maintained by Google Cloud.

---

## Credits

This practical exercise, including its code, was created by **Rodrigo Brito**, a master's student at DCC/UFMG, as part of his activities in the Teaching Internship course, taken in 2020/2, under the supervision of **Prof. Marco Tulio Valente**.

The code in this repository is under an MIT license. The instructions described above are under a CC-BY license.
