# Treasury DAO

This is the place for all the forming documents of Treasury DAO, scripts and tools.

## Constitution

TODO

## Code of Conduct

TODO

## Staking snapshot

Staking snapshot is the code that snapshots the amount staked and delegated by all the users.
The amounts in the snapshot are used as a weight for user votes in the voting contract.
On chain only merkle root of the snapshot is stored, off-chain path is computed when the vote is cast and provided to the contract.

The snapshot format is `account_id,amount`, sorted by `account_id` to ensure predictability.

Lockup contracts are resolved to the owner. All delegations across mulitple pools are sumed.

## Voting contract

Voting contract that is used to self nominate as candidate and voting.

Next set of APIs are present:
 - `set_snapshot(hash: CryptoHash)` -- can be only called once a quarter by `owner_id`.
 - `self_nominate(gov_forum_link: String)` -- can be used by individual who wants to be candidate into members. Can be called at any point. The critical piece is the link to the governance forum that will link their discussion identity and other info. This requires a small deposit to cover storage of this information.
 - `vote(candidate_id: AccountId, vote_amount: Balance, total_amount: Balance, proof: MerkleProof)` -- given account delegates part of their "weight" `vote_amount` to given candidate. `total_amount` and `proof` are required to validate this user in the snapshot.

Next view functions are available:
 - `get_owner() -> AccountId` -- account that can be set `owner_id`
 - `get_snapshot_hash() -> CryptoHash` -- returns hash of the snapshot. Can be used to verify that snapshot is correct.
 - `get_user_votes(account_id: AccountId) -> [(AccountId, Balance)]` -- returns votes of the given user. The available for voting weight is balance of this user minus all already casted votes.
 - `get_candidate_count() -> u32` -- number of candidates.
 - `get_candidates(from_index: u32, limit: u32) -> [Candidate]` -- list of candidates from given interval with their votes.
 - `get_candidate(account_id: AccountId) -> Candidate` -- total number of votes casted for given candidate.

Where `Candidate { account_id: AccountId, votes: Balance, gov_forum_link: String}`.

User full balance is retrievable from the snapshot. Frontends and CLI tools must have this snapshot available to retrieve the balance and to compute merkle proof for voting.

> Note, that current voting contract requires manual intervention to set snapshots of the stake due to limitations of lockup/staking contracts pair.
> This problem will be addressed over time, which will allow to transition to vote without extra snapshotting.

## Voting UI

User interface to submit self nomination and vote.

