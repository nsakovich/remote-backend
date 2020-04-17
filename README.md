# 1. Motivation

In some casese you don't want (or can't) to run all your project backend locally. Instead of it you prefer to use production server or any other environment as backend. It happens when you want to debug any complex issue which happens only for specific customer or environment. Also it's very usefull when your laptop doesn't have enouhg resources for running all backend stuff.

So it makes a lot of sence to have possibility run only UI locally (as a rule you have light local development server which buids and runs your UI with webpack for example, or any other CLI tool) and use remote backend.

And motivation of this project is to help you to do this.

# 2. Requirements and limitations

- you should already have light development server which runs your UI locally. If your project is still a big monolit and you don't use microservice architecture it will not help you
- Google Chrome should be installed on your development machine. 99% developers already have it.
- NodeJS and NPM should be installed

# 3. SSL support

If your remote environment use HTTPS you should prepare self signed certificate for work with it. For example if your remote backend use domain: myapp.example.com you should do the next:

1) install `openssl` if you don't have it
2) inside root of this project exectute the next commands:
   - `openssl genrsa -out server.key 2048`- generate server key
   - `openssl req -new -sha256 -key server.key -out server.csr` - create signing request. Enter myapp.example.com as a "Common Name". Leave password blank.
   - `openssl req -x509 -sha256 -days 365 -key server.key -in server.csr -out server.crt` - generate self-signed certificate.

# 4. How to Run

Imagine that your remote backend is placeded on `https://myapp.example.com` and all API is available under `https://myapp.example.com/api`. And locally you run your dev server on port `8080`. So if you want to start work with remote backend you should do the next:

`npm install -g remote-backend` - install the tool
`sudo remote-backend -s -b myapp.example.com -a /api -p 8080` - run it

it will install all dependencies and run Chrome instance. Inside this instance you will be able to see your local UI which will work with remote backend.

For help run `remote-backend --help`
