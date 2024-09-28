import type { ExecaChildProcess } from 'execa';
import * as vscode from 'vscode';
import type { RepoExplorerProvider } from '@/views/RepoExplorerProvider';

export const CommandId = 'showCloneRepoProgress';

export function registryShowCloneRepoProgress(repoExplorerProvider: RepoExplorerProvider) {
  return vscode.commands.registerCommand(
    CommandId,
    (
      gitCloneSubprocess: ExecaChildProcess<string>,
      abortController: AbortController,
      gitRepoUrl: string,
      localRepoPath: string,
    ) => {
      vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Start cloning repository ${gitRepoUrl} into ${localRepoPath}.`,
        cancellable: true,
      }, async (__, token) => {
        token.onCancellationRequested(() => {
          abortController.abort();
        });

        return gitCloneSubprocess;
      }).then(
        () => {
          // Get latest local repo.
          repoExplorerProvider.refresh();

          const open = 'Open';
          const openInNewWindow = 'Open in New Window';
          vscode.window.showInformationMessage(
            `Clone repository to ${localRepoPath} Successfully! Do you want open it?`,
            open,
            openInNewWindow
          ).then(res => {
            let newWindow = false
            switch (res) {
              case openInNewWindow:
                newWindow = true;
              case open:
                vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(localRepoPath), {
                  forceNewWindow: newWindow});
                break;
            }
          });
        },
        (error: any) => {
          if (gitCloneSubprocess.killed || error.isCanceled) {
            vscode.window.showInformationMessage(`Cancel clone git repository ${gitRepoUrl}.`);
            return;
          }
          vscode.window.showErrorMessage(`Clone ${gitRepoUrl} error: ${error.stderr}`);
        },
      );
    });
}
