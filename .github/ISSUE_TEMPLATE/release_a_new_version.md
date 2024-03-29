---
name: Release a New Version!
about: Prepare a release to be launched
title: ""
labels: release
---

<!-- Please Follow this checklist before making your release. Thanks! -->

## Release Checklist

> Attention: the examples below use the version `x.y.z` but you should update
> them to use the version you're releasing.

### Git Preparation

- [ ] Decide on a version number based on the current version number and the
      common rules defined in [Semantic Versioning](https://semver.org). E.g.
      `x.y.z`.
- [ ] Update this ticket name to reflect the new version number, following the
      pattern "Release `x.y.z`".
- [ ] Cut a branch for the new release out of the `develop` branch, following
      the gitflow naming pattern `release/x.y.z`.

### Code Preparation

- [ ] Update the project's version in [package.json] accordingly.
- [ ] Update the [CHANGELOG.md] with the new version number and release notes.
- [ ] Run tests and linting, and make sure the version running in the default
      branch is working end-to-end. At least the minimal end-to-end manual tests
      is mandatory.
- [ ] 🚨 DO NOT RELEASE before holidays or weekends! Mondays and Tuesdays are
      preferred. This doesn't apply if you're releasing a release-candidate
      (pre-release).

### Merging the Branches

> 🚨 ATTENTION: in the following steps, do `merge commits` and NOT
> `squash-and-merge`!

- [ ] When the team is confident the release is stable, you'll need to create
      two pull requests:
  - [ ] `release/x.y.z -> main`: This PR should be merged with a merge commit.
        Skip this step if releasing a release-candidate (pre-release).
  - [ ] `release/x.y.z -> develop`: this should be merged after the `main`
        branch is merged. This PR should be merged with a merge commit.

### Publishing the Release

- [ ] After the release branch is merged to `main`, create a new release on
      GitHub with the name `x.y.z` and the use the same changes from the
      [CHANGELOG.md] file.
  - [ ] The release should automatically publish a new version of the docker
        image to Docker Hub. Double check if that happened.

### Publishing a Pre-Release

- [ ] After the pre-release branch is merged to `develop`, create a new release
      on GitHub with the name `x.y.z` and the use the same changes from the
      [CHANGELOG.md] file.
  - [ ] Make sure to mark the release as a pre-release.
  - [ ] The pre-release should automatically publish a new version of the docker
        image to Docker Hub. Double check if that happened.
  - [ ] The pre-release should not update the `latest` tag on Docker Hub.

[package.json]:
  https://github.com/stellar/stellar-disbursement-platform-frontend/blob/develop/package.json
[CHANGELOG.md]:
  https://github.com/stellar/stellar-disbursement-platform-frontend/blob/develop/CHANGELOG.md
