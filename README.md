# Sign-In with Ethereum Authentication

This repository offers a sample implementation for Sign-In with Ethereum, based on the [EIP-4361](https://eips.ethereum.org/EIPS/eip-4361) standard. This form of off-chain authentication allows users to control their digital identity with their Ethereum account and ENS profile, offering a secure alternative to traditional forms of authentication.

## Overview

The project utilizes SIWE (Sign-In with Ethereum) packages to implement this form of authentication. The front-end is built using Next.js and uses the [SIWE package](https://github.com/spruceid/siwe/tree/main/packages/siwe). The backend is Dockerized and implemented using FastAPI and [siwe-py](https://github.com/spruceid/siwe-py).

**Note**: This project is a work-in-progress and state management is not yet optimized for production. The state may be reset if the container is killed.

## Features

- Off-chain authentication based on ERC-4361 standard
- Backend implemented in FastAPI with siwe-py
- Front-end developed using Next.js
- Session management with nonce-based challenge

## Documentation

For more information on SIWE and its features, consult the official [SIWE documentation](https://docs.login.xyz/).

## Quick Start

FE: npm i && npm dev
BE: ./rebuild.sh

## Acknowledgements

Special thanks to:

- [Spruce ID](https://github.com/spruceid) for providing the SIWE package.
- [Gui Bibeau](https://github.com/GuiBibeau) \@GuiBibeau: For their example on browser login and interaction.
- [Eric Bishard](https://github.com/httpJunkie) \@httpJunkie

## License

http://www.apache.org/licenses/LICENSE-2.0
