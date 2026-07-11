<a id="readme-top"></a>

[![CI](https://github.com/filiprak/visual-qa-console/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/filiprak/visual-qa-console/actions/workflows/test.yml)
![GitHub License](https://img.shields.io/github/license/filiprak/visual-qa-console)

<br />
<div align="center">
  <a href="https://github.com/filiprak/visual-qa-console">
    <img src="frontend/public/logo.svg" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Visual QA Console</h3>

  <p align="center">
    A visual QA dashboard for reviewing UI screenshots with built-in accept/reject approval workflows. Ideal for visual regression testing and design sign-offs.
    <br/>
    <br/>
    <a href="https://github.com/filiprak/visual-qa-console/issues/new?labels=bug">Report Bug</a>
    &middot;
    <a href="https://github.com/filiprak/visual-qa-console/issues/new?labels=enhancement">Request Feature</a>
  </p>
</div>


## About The Project

I built this dashboard because I couldn't find a simple tool to view UI screenshots, manage baseline images, and collect results from CI/CD pipelines.

This tool keeps it simple:

* **Baseline Management**: Easily store and track your accepted screenshots.
* **Quick Approvals**: Use the built-in accept/reject workflow to sign off on UI changes in seconds.
* **CI/CD Ready**: Gather and review test results directly from your pipeline through REST API.

Feel free to fork the repo, open an issue, or submit a pull request if you have ideas for improvement.

![Visual QA Console][product-screenshot]

![Visual QA Console][diff-screenshot]

<p align="right">(<a href="#readme-top">back to top</a>)</p>


### Built With

* [![Vue][Vue.js]][Vue-url]
* [![Node][Node.js]][Node-url]
* [![Feathers][Feathers.js]][Feathers-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>


## Running application

1. Clone and install:
```bash
git clone https://github.com/filiprak/visual-qa-console.git
cd visual-qa-console/

pnpm install
```

2. Create `.env` file with content:
```
PORT=8989
HOST=0.0.0.0
SSL=0
SSL_CERT=/path/to/cert
SSL_KEY=/path/to/key
JWT_SECRET=mysecret
```
3. Prepare database:
```bash
mkdir data/
pnpm migrate
```
4. Build and run the app:
```bash
pnpm build
pnpm start
```
5. Got to `http://locahost:8989`, by default admin account is auto created with credentials:
- email `admin@example.com`
- password: `admin`

## Development with live reload support
```bash
pnpm dev
```

## Running tests
```bash
pnpm test
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[product-screenshot]: images/screenshot.png
[diff-screenshot]: images/screenshot-diff.png
[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Vue-url]: https://vuejs.org/
[Node.js]: https://img.shields.io/badge/Node.js-5FA04E?style=for-the-badge&logo=node.js&logoColor=white
[Node-url]: https://nodejs.org/
[Feathers.js]: https://img.shields.io/badge/FeathersJS-2b2b2b?style=for-the-badge&logo=feathersjs&logoColor=white
[Feathers-url]: https://feathersjs.com/