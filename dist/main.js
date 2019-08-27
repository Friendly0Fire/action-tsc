"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const exec_1 = require("@actions/exec");
const core_1 = require("@actions/core");
const github_1 = require("@actions/github");
const { GITHUB_TOKEN, GITHUB_SHA } = process.env;
const ACTION_NAME = 'TSC';
async function lint(data) {
    const annotations = [];
    const results = [...data.matchAll(/^([^()]+)\((\d+),(\d)\): (error|warning) (.+): (.+)$/gm)];
    for (const res of results) {
        const [, path, line, column, severity, ruleId, message] = res;
        annotations.push({
            path,
            start_line: parseInt(line, 10),
            end_line: parseInt(line, 10),
            start_column: parseInt(column, 10),
            end_column: parseInt(column, 10),
            annotation_level: severity === 'error' ? 'failure' : 'warning',
            title: ruleId || ACTION_NAME,
            message
        });
    }
    return {
        conclusion: annotations.length ? 'success' : 'failure',
        output: {
            title: ACTION_NAME,
            summary: annotations.length ? 'Green lights' : 'TSC error',
            annotations
        }
    };
}
async function check(data) {
    const octokit = new github_1.GitHub(GITHUB_TOKEN);
    let currentSha;
    let info;
    if (github_1.context.issue && github_1.context.issue.number) {
        info = await octokit.graphql(`query($owner: String!, $name: String!, $prNumber: Int!) {
			repository(owner: $owner, name: $name) {
				pullRequest(number: $prNumber) {
					files(first: 100) {
						nodes {
							path
						}
					}
					commits(last: 1) {
						nodes {
							commit {
								oid
							}
						}
					}
				}
			}
		}`, {
            owner: github_1.context.repo.owner,
            name: github_1.context.repo.repo,
            prNumber: github_1.context.issue.number
        });
        currentSha = info.repository.pullRequest.commits.nodes[0].commit.oid;
    }
    else {
        info = await octokit.repos.getCommit({ owner: github_1.context.repo.owner, repo: github_1.context.repo.repo, ref: GITHUB_SHA });
        currentSha = GITHUB_SHA;
    }
    core_1.debug(`Commit: ${currentSha}`);
    let id;
    const jobName = core_1.getInput('job-name');
    if (jobName) {
        const checks = await octokit.checks.listForRef({
            ...github_1.context.repo,
            status: 'in_progress',
            ref: currentSha
        });
        const check = checks.data.check_runs.find(({ name }) => name.toLowerCase() === jobName.toLowerCase());
        if (check)
            id = check.id;
    }
    if (!id) {
        id = (await octokit.checks.create({
            ...github_1.context.repo,
            name: ACTION_NAME,
            head_sha: currentSha,
            status: 'in_progress',
            started_at: new Date().toISOString()
        })).data.id;
    }
    try {
        const { conclusion, output } = await lint(data);
        await octokit.checks.update({
            ...github_1.context.repo,
            check_run_id: id,
            completed_at: new Date().toISOString(),
            conclusion,
            output
        });
        core_1.debug(output.summary);
        if (conclusion === 'failure')
            core_1.setFailed(output.summary);
    }
    catch (error) {
        await octokit.checks.update({
            ...github_1.context.repo,
            check_run_id: id,
            conclusion: 'failure',
            completed_at: new Date().toISOString()
        });
        core_1.setFailed(error.message);
    }
}
async function run() {
    try {
        await exec_1.exec('node', [`${path_1.join(process.cwd(), 'node_modules/typescript/bin/tsc')}`, '--noEmit', '--noErrorTruncation', '--pretty', 'false'], {
            listeners: {
                stdout: async (data) => {
                    await check(data.toString());
                }
            }
        });
    }
    catch (error) {
        core_1.setFailed(error.message);
    }
}
run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlcyI6WyJtYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQTRCO0FBQzVCLHdDQUFxQztBQUNyQyx3Q0FBMkQ7QUFDM0QsNENBQWtEO0FBR2xELE1BQU0sRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztBQUVqRCxNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFFMUIsS0FBSyxVQUFVLElBQUksQ0FBQyxJQUFZO0lBQy9CLE1BQU0sV0FBVyxHQUEwQyxFQUFFLENBQUM7SUFDOUQsTUFBTSxPQUFPLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsd0RBQXdELENBQUMsQ0FBQyxDQUFDO0lBQzdGLEtBQUssTUFBTSxHQUFHLElBQUksT0FBTyxFQUFFO1FBQzFCLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsR0FBRyxDQUFDO1FBQzlELFdBQVcsQ0FBQyxJQUFJLENBQUM7WUFDaEIsSUFBSTtZQUNKLFVBQVUsRUFBRSxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQztZQUM5QixRQUFRLEVBQUUsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUM7WUFDNUIsWUFBWSxFQUFFLFFBQVEsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDO1lBQ2xDLFVBQVUsRUFBRSxRQUFRLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztZQUNoQyxnQkFBZ0IsRUFBRSxRQUFRLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVM7WUFDOUQsS0FBSyxFQUFFLE1BQU0sSUFBSSxXQUFXO1lBQzVCLE9BQU87U0FDUCxDQUFDLENBQUM7S0FDSDtJQUVELE9BQU87UUFDTixVQUFVLEVBQUUsV0FBVyxDQUFDLE1BQU0s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O1xuaW1wb3J0IHsgZXhlYyB9IGZyb20gJ0BhY3Rpb25zL2V4ZWMnO1xuaW1wb3J0IHsgZ2V0SW5wdXQsIHNldEZhaWxlZCwgZGVidWcgfSBmcm9tICdAYWN0aW9ucy9jb3JlJztcbmltcG9ydCB7IEdpdEh1YiwgY29udGV4dCB9IGZyb20gJ0BhY3Rpb25zL2dpdGh1Yic7XG5pbXBvcnQgeyBDaGVja3NVcGRhdGVQYXJhbXNPdXRwdXRBbm5vdGF0aW9ucywgQ2hlY2tzQ3JlYXRlUGFyYW1zIH0gZnJvbSAnQG9jdG9raXQvcmVzdCc7XG5cbmNvbnN0IHsgR0lUSFVCX1RPS0VOLCBHSVRIVUJfU0hBIH0gPSBwcm9jZXNzLmVudjtcblxuY29uc3QgQUNUSU9OX05BTUUgPSAnVFNDJztcblxuYXN5bmMgZnVuY3Rpb24gbGludChkYXRhOiBzdHJpbmcpIHtcblx0Y29uc3QgYW5ub3RhdGlvbnM6IENoZWNrc1VwZGF0ZVBhcmFtc091dHB1dEFubm90YXRpb25zW10gPSBbXTtcblx0Y29uc3QgcmVzdWx0cyA9IFsuLi5kYXRhLm1hdGNoQWxsKC9eKFteKCldKylcXCgoXFxkKyksKFxcZClcXCk6IChlcnJvcnx3YXJuaW5nKSAoLispOiAoLispJC9nbSldO1xuXHRmb3IgKGNvbnN0IHJlcyBvZiByZXN1bHRzKSB7XG5cdFx0Y29uc3QgWywgcGF0aCwgbGluZSwgY29sdW1uLCBzZXZlcml0eSwgcnVsZUlkLCBtZXNzYWdlXSA9IHJlcztcblx0XHRhbm5vdGF0aW9ucy5wdXNoKHtcblx0XHRcdHBhdGgsXG5cdFx0XHRzdGFydF9saW5lOiBwYXJzZUludChsaW5lLCAxMCksXG5cdFx0XHRlbmRfbGluZTogcGFyc2VJbnQobGluZSwgMTApLFxuXHRcdFx0c3RhcnRfY29sdW1uOiBwYXJzZUludChjb2x1bW4sIDEwKSxcblx0XHRcdGVuZF9jb2x1bW46IHBhcnNlSW50KGNvbHVtbiwgMTApLFxuXHRcdFx0YW5ub3RhdGlvbl9sZXZlbDogc2V2ZXJpdHkgPT09ICdlcnJvcicgPyAnZmFpbHVyZScgOiAnd2FybmluZycsXG5cdFx0XHR0aXRsZTogcnVsZUlkIHx8IEFDVElPTl9OQU1FLFxuXHRcdFx0bWVzc2FnZVxuXHRcdH0pO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRjb25jbHVzaW9uOiBhbm5vdGF0aW9ucy5sZW5ndGggPyAnc3VjY2VzcycgOiAnZmFpbHVyZScgYXMgQ2hlY2tzQ3JlYXRlUGFyYW1zWydjb25jbHVzaW9uJ10sXG5cdFx0b3V0cHV0OiB7XG5cdFx0XHR0aXRsZTogQUNUSU9OX05BTUUsXG5cdFx0XHRzdW1tYXJ5OiBhbm5vdGF0aW9ucy5sZW5ndGggPyAnR3JlZW4gbGlnaHRzJyA6ICdUU0MgZXJyb3InLFxuXHRcdFx0YW5ub3RhdGlvbnNcblx0XHR9XG5cdH07XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNoZWNrKGRhdGE6IHN0cmluZykge1xuXHRjb25zdCBvY3Rva2l0ID0gbmV3IEdpdEh1YihHSVRIVUJfVE9LRU4hKTtcblxuXHRsZXQgY3VycmVudFNoYTogc3RyaW5nO1xuXHRsZXQgaW5mbztcblx0aWYgKGNvbnRleHQuaXNzdWUgJiYgY29udGV4dC5pc3N1ZS5udW1iZXIpIHtcblx0XHRpbmZvID0gYXdhaXQgb2N0b2tpdC5ncmFwaHFsKGBxdWVyeSgkb3duZXI6IFN0cmluZyEsICRuYW1lOiBTdHJpbmchLCAkcHJOdW1iZXI6IEludCEpIHtcblx0XHRcdHJlcG9zaXRvcnkob3duZXI6ICRvd25lciwgbmFtZTogJG5hbWUpIHtcblx0XHRcdFx0cHVsbFJlcXVlc3QobnVtYmVyOiAkcHJOdW1iZXIpIHtcblx0XHRcdFx0XHRmaWxlcyhmaXJzdDogMTAwKSB7XG5cdFx0XHRcdFx0XHRub2RlcyB7XG5cdFx0XHRcdFx0XHRcdHBhdGhcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y29tbWl0cyhsYXN0OiAxKSB7XG5cdFx0XHRcdFx0XHRub2RlcyB7XG5cdFx0XHRcdFx0XHRcdGNvbW1pdCB7XG5cdFx0XHRcdFx0XHRcdFx0b2lkXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9YCxcblx0XHR7XG5cdFx0XHRvd25lcjogY29udGV4dC5yZXBvLm93bmVyLFxuXHRcdFx0bmFtZTogY29udGV4dC5yZXBvLnJlcG8sXG5cdFx0XHRwck51bWJlcjogY29udGV4dC5pc3N1ZS5udW1iZXJcblx0XHR9KTtcblx0XHRjdXJyZW50U2hhID0gaW5mby5yZXBvc2l0b3J5LnB1bGxSZXF1ZXN0LmNvbW1pdHMubm9kZXNbMF0uY29tbWl0Lm9pZDtcblx0fSBlbHNlIHtcblx0XHRpbmZvID0gYXdhaXQgb2N0b2tpdC5yZXBvcy5nZXRDb21taXQoeyBvd25lcjogY29udGV4dC5yZXBvLm93bmVyLCByZXBvOiBjb250ZXh0LnJlcG8ucmVwbywgcmVmOiBHSVRIVUJfU0hBISB9KTtcblx0XHRjdXJyZW50U2hhID0gR0lUSFVCX1NIQSE7XG5cdH1cblx0ZGVidWcoYENvbW1pdDogJHtjdXJyZW50U2hhfWApO1xuXG5cdGxldCBpZDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuXHRjb25zdCBqb2JOYW1lID0gZ2V0SW5wdXQoJ2pvYi1uYW1lJyk7XG5cdGlmIChqb2JOYW1lKSB7XG5cdFx0Y29uc3QgY2hlY2tzID0gYXdhaXQgb2N0b2tpdC5jaGVja3MubGlzdEZvclJlZih7XG5cdFx0XHQuLi5jb250ZXh0LnJlcG8sXG5cdFx0XHRzdGF0dXM6ICdpbl9wcm9ncmVzcycsXG5cdFx0XHRyZWY6IGN1cnJlbnRTaGFcblx0XHR9KTtcblx0XHRjb25zdCBjaGVjayA9IGNoZWNrcy5kYXRhLmNoZWNrX3J1bnMuZmluZCgoeyBuYW1lIH0pID0+IG5hbWUudG9Mb3dlckNhc2UoKSA9PT0gam9iTmFtZS50b0xvd2VyQ2FzZSgpKTtcblx0XHRpZiAoY2hlY2spIGlkID0gY2hlY2suaWQ7XG5cdH1cblx0aWYgKCFpZCkge1xuXHRcdGlkID0gKGF3YWl0IG9jdG9raXQuY2hlY2tzLmNyZWF0ZSh7XG5cdFx0XHQuLi5jb250ZXh0LnJlcG8sXG5cdFx0XHRuYW1lOiBBQ1RJT05fTkFNRSxcblx0XHRcdGhlYWRfc2hhOiBjdXJyZW50U2hhLFxuXHRcdFx0c3RhdHVzOiAnaW5fcHJvZ3Jlc3MnLFxuXHRcdFx0c3RhcnRlZF9hdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG5cdFx0fSkpLmRhdGEuaWQ7XG5cdH1cblxuXHR0cnkge1xuXHRcdGNvbnN0IHsgY29uY2x1c2lvbiwgb3V0cHV0IH0gPSBhd2FpdCBsaW50KGRhdGEpO1xuXHRcdGF3YWl0IG9jdG9raXQuY2hlY2tzLnVwZGF0ZSh7XG5cdFx0XHQuLi5jb250ZXh0LnJlcG8sXG5cdFx0XHRjaGVja19ydW5faWQ6IGlkLFxuXHRcdFx0Y29tcGxldGVkX2F0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG5cdFx0XHRjb25jbHVzaW9uLFxuXHRcdFx0b3V0cHV0XG5cdFx0fSk7XG5cdFx0ZGVidWcob3V0cHV0LnN1bW1hcnkpO1xuXHRcdGlmIChjb25jbHVzaW9uID09PSAnZmFpbHVyZScpIHNldEZhaWxlZChvdXRwdXQuc3VtbWFyeSk7XG5cdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0YXdhaXQgb2N0b2tpdC5jaGVja3MudXBkYXRlKHtcblx0XHRcdC4uLmNvbnRleHQucmVwbyxcblx0XHRcdGNoZWNrX3J1bl9pZDogaWQsXG5cdFx0XHRjb25jbHVzaW9uOiAnZmFpbHVyZScsXG5cdFx0XHRjb21wbGV0ZWRfYXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuXHRcdH0pO1xuXHRcdHNldEZhaWxlZChlcnJvci5tZXNzYWdlKTtcblx0fVxufVxuXG5hc3luYyBmdW5jdGlvbiBydW4oKSB7XG5cdHRyeSB7XG5cdFx0YXdhaXQgZXhlYygnbm9kZScsIFtgJHtqb2luKHByb2Nlc3MuY3dkKCksICdub2RlX21vZHVsZXMvdHlwZXNjcmlwdC9iaW4vdHNjJyl9YCwgJy0tbm9FbWl0JywgJy0tbm9FcnJvclRydW5jYXRpb24nLCAnLS1wcmV0dHknLCAnZmFsc2UnXSwge1xuXHRcdFx0bGlzdGVuZXJzOiB7XG5cdFx0XHRcdHN0ZG91dDogYXN5bmMgKGRhdGE6IEJ1ZmZlcikgPT4ge1xuXHRcdFx0XHRcdGF3YWl0IGNoZWNrKGRhdGEudG9TdHJpbmcoKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRzZXRGYWlsZWQoZXJyb3IubWVzc2FnZSk7XG5cdH1cbn1cblxucnVuKCk7XG4iXX0=