/**
 * Banken Tasks Module
 * ES6 Module for task completion and workflow management
 */

// ========================================
// TASK COMPLETION
// ========================================

export function completeTask(taskId) {
    const taskElement = document.querySelector(`.aufgabe-item [onclick*="completeTask('${taskId}')"]`)?.closest('.aufgabe-item');

    let taskTitle = 'Aufgabe erledigt';
    let customerId = null;

    if (taskElement) {
        taskTitle = taskElement.querySelector('.aufgabe-title')?.textContent?.trim() ?? taskTitle;
        customerId = taskElement.querySelector('.aufgabe-customer')?.textContent?.trim() ?? null;
    }

    openTaskCompletionDialog(taskId, taskTitle, customerId, taskElement);
}

export function openTaskCompletionDialog(taskId, taskTitle, customerId, taskElement) {
    let modal = document.getElementById('taskCompletionModal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'taskCompletionModal';
        modal.className = 'task-completion-modal';
        modal.innerHTML = `
            <div class="task-completion-content">
                <div class="task-completion-header">
                    <h3>Aufgabe abschließen</h3>
                    <button class="task-completion-close" onclick="closeTaskCompletionDialog()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="task-completion-body">
                    <div class="task-info-display">
                        <span class="task-info-label">Aufgabe:</span>
                        <span class="task-info-value" id="completionTaskTitle"></span>
                    </div>
                    <div class="task-form-group">
                        <label>Was war das Problem?</label>
                        <textarea id="taskProblem" placeholder="Beschreiben Sie das ursprüngliche Problem..."></textarea>
                    </div>
                    <div class="task-form-group">
                        <label>Wie wurde es gelöst?</label>
                        <textarea id="taskSolution" placeholder="Beschreiben Sie die durchgeführte Lösung..."></textarea>
                    </div>
                </div>
                <div class="task-completion-footer">
                    <button class="task-cancel-btn" onclick="closeTaskCompletionDialog()">Abbrechen</button>
                    <button class="task-complete-btn" onclick="submitTaskCompletion()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Als erledigt markieren
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        addTaskCompletionStyles();
    }

    modal.dataset.taskId = taskId;
    modal.dataset.taskTitle = taskTitle;
    modal.dataset.customerId = customerId ?? '';

    document.getElementById('completionTaskTitle').textContent = taskTitle;
    document.getElementById('taskProblem').value = '';
    document.getElementById('taskSolution').value = '';

    modal.style.display = 'flex';
    setTimeout(() => document.getElementById('taskProblem')?.focus(), 100);
}

export function closeTaskCompletionDialog() {
    const modal = document.getElementById('taskCompletionModal');
    if (modal) modal.style.display = 'none';
}

export function submitTaskCompletion() {
    const modal = document.getElementById('taskCompletionModal');
    const { taskId, taskTitle, customerId } = modal.dataset;
    const problem = document.getElementById('taskProblem')?.value?.trim() ?? '';
    const solution = document.getElementById('taskSolution')?.value?.trim() ?? '';

    if (!problem || !solution) {
        window.showNotification?.('Bitte füllen Sie beide Felder aus', 'error');
        return;
    }

    const taskElement = document.querySelector(`.aufgabe-item [onclick*="completeTask('${taskId}')"]`)?.closest('.aufgabe-item');
    if (taskElement) {
        taskElement.classList.add('completed');
        Object.assign(taskElement.style, { opacity: '0.5', textDecoration: 'line-through' });
    }

    if (customerId) {
        window.currentCustomerId = customerId;

        const activity = {
            id: Date.now().toString(),
            type: 'aufgabe',
            typeLabel: 'Aufgabe erledigt',
            text: `**${taskTitle}**\n\n**Problem:** ${problem}\n\n**Lösung:** ${solution}\n\n✅ Status: Erledigt`,
            author: localStorage.getItem('feedbackAuthor') ?? 'Eike',
            timestamp: new Date().toISOString(),
            isCompleted: true
        };

        window.saveCustomerActivity?.(customerId, activity);

        closeTaskCompletionDialog();
        window.showNotification?.(`Aufgabe "${taskTitle}" erledigt`, 'success');

        setTimeout(() => {
            window.openCustomerDetail?.(customerId, { showKommunikation: true });
        }, 500);
    } else {
        closeTaskCompletionDialog();
        window.showNotification?.(`Aufgabe ${taskId} abgeschlossen`, 'success');
    }
}

function addTaskCompletionStyles() {
    if (document.getElementById('task-completion-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'task-completion-styles';
    styles.textContent = `
        .task-completion-modal {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            align-items: center;
            justify-content: center;
        }
        .task-completion-content {
            background: white;
            border-radius: 12px;
            width: min(90%, 550px);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .task-completion-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid #e2e8f0;
        }
        .task-completion-header h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
        }
        .task-completion-close {
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            color: #64748b;
        }
        .task-completion-close:hover { color: #1e293b; }
        .task-completion-body { padding: 20px; }
        .task-info-display {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 20px;
        }
        .task-info-label {
            font-size: 12px;
            color: #0369a1;
            display: block;
            margin-bottom: 4px;
        }
        .task-info-value {
            font-size: 14px;
            font-weight: 600;
            color: #0c4a6e;
        }
        .task-form-group { margin-bottom: 16px; }
        .task-form-group label {
            display: block;
            font-size: 13px;
            font-weight: 500;
            color: #374151;
            margin-bottom: 6px;
        }
        .task-form-group textarea {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            font-family: inherit;
            min-height: 80px;
            resize: vertical;
        }
        .task-form-group textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .task-completion-footer {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            padding: 16px 20px;
            border-top: 1px solid #e2e8f0;
        }
        .task-cancel-btn {
            padding: 10px 16px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            background: white;
            color: #374151;
            font-size: 14px;
            cursor: pointer;
        }
        .task-complete-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            background: #10b981;
            color: white;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
        }
        .task-complete-btn:hover { background: #059669; }
    `;
    document.head.appendChild(styles);
}
