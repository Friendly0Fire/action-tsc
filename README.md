# action-tsc
> Typescript compiler [action](https://github.com/features/actions)

Compile your Typescript code and check for errors.

## Usage

`.github/workflows/tsc.yml`
```yml
on:
  push:
  pull_request:

jobs:
  tsc:
    name: tsc
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - name: install node v12
      uses: actions/setup-node@v1
      with:
        node-version: 12
    - name: yarn install
      run: yarn install
    - name: tsc
      uses: icrawl/action-tsc@v1
```

### Parameters

You can pass the `--project` parameter to `tsc` if your `tsconfig.json` is not in the root of your project:

```yml
    - name: tsc compile
      uses: iCrawl/action-tsc@v1
      with:
        project: subdirectorywith_tsconfig
```

Similarly, you can pass the `--build` parameter to `tsc`.

You can specify `executable` to use, e.g., `ttsc` instead of the default `tsc`.

## Author

Authored by iCrawl. Repackaged by Friendly0Fire.