"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const exec_1 = require("@actions/exec");
const path_1 = require("path");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const project = core_1.getInput('project');
        const build = core_1.getInput('build');
        const executable = core_1.getInput('executable');
        console.log(`##[add-matcher]${path_1.join(__dirname, '..', '.github', 'tsc.json')}`);
        const args = [
            `${path_1.join(process.cwd(), 'node_modules/.bin', executable)}`,
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
            yield exec_1.exec('node', args);
        }
        catch (error) {
            core_1.setFailed('');
        }
    });
}
void run();
