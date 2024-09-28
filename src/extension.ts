import * as vscode from 'vscode';
import { registerCommands } from '@/commands';
import { RepoExplorerProvider } from '@/views/RepoExplorerProvider';

export async function activate(context: vscode.ExtensionContext) {
  const repoExplorerProvider = new RepoExplorerProvider();
  context.subscriptions.push(
    vscode.window.createTreeView('repoExplorer', { treeDataProvider: repoExplorerProvider }),
  );

  registerCommands(context, repoExplorerProvider);
}

export async function deactivate() { }
