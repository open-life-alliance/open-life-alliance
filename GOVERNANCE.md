# Governance

Open Life Alliance is open to everyone, and it is maintained carefully. Anyone can propose
ideas, translations, designs or code. Nothing reaches the live website until a maintainer has
reviewed and approved it.

## Roles

| Role | Who | Can |
|---|---|---|
| **Contributor** | Anyone with a GitHub account | Open issues and discussions, propose changes through pull requests, review others' work |
| **Maintainer** | The project founder (see `.github/CODEOWNERS`) | Approve and merge pull requests, publish releases, moderate, set direction |

As the community grows, trusted contributors may be invited to become maintainers for specific
areas (for example a language or the card designs). New maintainers are added by a pull request
to `.github/CODEOWNERS` and this file, approved by the founder.

## How a change gets published

```text
contributor          maintainer                    automatic
───────────          ──────────                    ─────────
fork / branch  ──►   pull request opened   ──►     CI: translations, lint, types, tests, build
                     review & discussion
                     approve  ✔
                     merge into main        ──►    website published from main
```

1. All changes — including the maintainers' own — go through a pull request to `main`.
2. `main` is protected: it cannot be pushed to directly, rewritten or deleted.
3. A pull request can be merged only when
   - the CI checks pass, and
   - a maintainer listed in `.github/CODEOWNERS` has approved it.
4. Any new commit after approval needs a fresh approval.
5. The website is built and published **only from `main`**, so only approved changes go live.

## Decisions

- Everyday changes are decided in the pull request.
- Larger changes (new features, the charter, the name or logo, anything involving money or
  personal data) start as an issue or discussion so the community can weigh in first.
- The founder makes the final decision while the project is young. The long-term goal
  (see [docs/ROADMAP.md](docs/ROADMAP.md), V4) is open, community-based governance.

## What we will always refuse

Changes that break the [Charter](CHARTER.md): paid membership, selling personal data,
presenting membership as a medical, religious, legal or government certification, or
pressuring anyone about how they live.

## Code of conduct

Everyone in project spaces follows the [Code of Conduct](CODE_OF_CONDUCT.md). Maintainers may
close, lock or remove contributions that do not.
