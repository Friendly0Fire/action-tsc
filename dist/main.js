import { getInput, setFailed } from '@actions/core';
import { exec } from '@actions/exec';
import { join } from 'path';
async function run() {
    const project = getInput('project');
    const build = getInput('build');
    const executable = getInput('executable');
    console.log(`##[add-matcher]${join(__dirname, '..', '.github', 'tsc.json')}`);
    const args = [
        `${join(process.cwd(), 'node_modules/.bin', executable)}`,
        '--noEmit',
        '--noErrorTruncation',
        '--pretty',
        'false',
        '--incremental',
        'false',
    ];
    if (project) {
        args.push('--project', project);
    }
    if (build) {
        args.splice(1, 0, '--build', build);
        // Remove --noEmit and --noErrorTruncation, which are unsupported with --build
        args.splice(3, 2);
        // Change --incremental false for --incremental true, as incremental builds are required for composite builds
        args.splice(-1, 1, 'true');
    }
    try {
        await exec('node', args);
    }
    catch (error) {
        setFailed('');
    }
}
void run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlcyI6WyJtYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3BELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDckMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUU1QixLQUFLLFVBQVUsR0FBRztJQUNqQixNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDcEMsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2hDLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUMxQyxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzlFLE1BQU0sSUFBSSxHQUFHO1FBQ1osR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLG1CQUFtQixFQUFFLFVBQVUsQ0FBQyxFQUFFO1FBQ3pELFVBQVU7UUFDVixxQkFBcUI7UUFDckIsVUFBVTtRQUNWLE9BQU87UUFDUCxlQUFlO1FBQ2YsT0FBTztLQUNQLENBQUM7SUFDRixJQUFJLE9BQU8sRUFBRTtRQUNaLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQ2hDO0lBQ0QsSUFBSSxLQUFLLEVBQUU7UUFDVixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3BDLDhFQUE4RTtRQUM5RSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNsQiw2R0FBNkc7UUFDN0csSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDM0I7SUFDRCxJQUFJO1FBQ0gsTUFBTSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ3pCO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDZixTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDZDtBQUNGLENBQUM7QUFFRCxLQUFLLEdBQUcsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0SW5wdXQsIHNldEZhaWxlZCB9IGZyb20gJ0BhY3Rpb25zL2NvcmUnO1xuaW1wb3J0IHsgZXhlYyB9IGZyb20gJ0BhY3Rpb25zL2V4ZWMnO1xuaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnO1xuXG5hc3luYyBmdW5jdGlvbiBydW4oKSB7XG5cdGNvbnN0IHByb2plY3QgPSBnZXRJbnB1dCgncHJvamVjdCcpO1xuXHRjb25zdCBidWlsZCA9IGdldElucHV0KCdidWlsZCcpO1xuXHRjb25zdCBleGVjdXRhYmxlID0gZ2V0SW5wdXQoJ2V4ZWN1dGFibGUnKTtcblx0Y29uc29sZS5sb2coYCMjW2FkZC1tYXRjaGVyXSR7am9pbihfX2Rpcm5hbWUsICcuLicsICcuZ2l0aHViJywgJ3RzYy5qc29uJyl9YCk7XG5cdGNvbnN0IGFyZ3MgPSBbXG5cdFx0YCR7am9pbihwcm9jZXNzLmN3ZCgpLCAnbm9kZV9tb2R1bGVzLy5iaW4nLCBleGVjdXRhYmxlKX1gLFxuXHRcdCctLW5vRW1pdCcsXG5cdFx0Jy0tbm9FcnJvclRydW5jYXRpb24nLFxuXHRcdCctLXByZXR0eScsXG5cdFx0J2ZhbHNlJyxcblx0XHQnLS1pbmNyZW1lbnRhbCcsXG5cdFx0J2ZhbHNlJyxcblx0XTtcblx0aWYgKHByb2plY3QpIHtcblx0XHRhcmdzLnB1c2goJy0tcHJvamVjdCcsIHByb2plY3QpO1xuXHR9XG5cdGlmIChidWlsZCkge1xuXHRcdGFyZ3Muc3BsaWNlKDEsIDAsICctLWJ1aWxkJywgYnVpbGQpO1xuXHRcdC8vIFJlbW92ZSAtLW5vRW1pdCBhbmQgLS1ub0Vycm9yVHJ1bmNhdGlvbiwgd2hpY2ggYXJlIHVuc3VwcG9ydGVkIHdpdGggLS1idWlsZFxuXHRcdGFyZ3Muc3BsaWNlKDMsIDIpO1xuXHRcdC8vIENoYW5nZSAtLWluY3JlbWVudGFsIGZhbHNlIGZvciAtLWluY3JlbWVudGFsIHRydWUsIGFzIGluY3JlbWVudGFsIGJ1aWxkcyBhcmUgcmVxdWlyZWQgZm9yIGNvbXBvc2l0ZSBidWlsZHNcblx0XHRhcmdzLnNwbGljZSgtMSwgMSwgJ3RydWUnKTtcblx0fVxuXHR0cnkge1xuXHRcdGF3YWl0IGV4ZWMoJ25vZGUnLCBhcmdzKTtcblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRzZXRGYWlsZWQoJycpO1xuXHR9XG59XG5cbnZvaWQgcnVuKCk7XG4iXX0=