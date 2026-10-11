---
title: Ansible Playbook - Hermes Agent Node Deployment
description: Standardized Ansibe playbook for installing Hermes Agent across fleet nodes
date: 2026-07-27
---

# Hermes Agent Node Deployment Playbook

This is a draft reference structure for deploying Hermes Agent based on P'Nat's architecture (User-per-Agent + uv toolchain + systemd/launchd).

```yaml
---
- name: Deploy Hermes Agent Node
  hosts: all
  become: yes
  vars:
    agent_user: "hermes"
    agent_home: "/home/{{ agent_user }}"
    repo_url: "https://github.com/NousResearch/hermes-agent.git"
    install_dir: "{{ agent_home }}/Code/github.com/NousResearch/hermes-agent"
    venv_dir: "{{ agent_home }}/.hermes-{{ agent_user }}/venv"

  tasks:
    - name: Ensure agent user exists
      user:
        name: "{{ agent_user }}"
        state: present
        shell: /bin/bash

    - name: Install system dependencies (Ubuntu/Debian)
      apt:
        name:
          - git
          - curl
          - build-essential
          - tmux
        state: present
      when: ansible_os_family == "Debian"

    - name: Install uv toolchain
      shell: curl -LsSf https://astral.sh/uv/install.sh | sh
      args:
        creates: "{{ agent_home }}/.cargo/bin/uv"
      become_user: "{{ agent_user }}"

    - name: Clone Hermes Agent repository
      git:
        repo: "{{ repo_url }}"
        dest: "{{ install_dir }}"
        update: yes
      become_user: "{{ agent_user }}"

    - name: Create virtual environment using uv
      command: "{{ agent_home }}/.cargo/bin/uv venv {{ venv_dir }}"
      args:
        creates: "{{ venv_dir }}/bin/python"
      become_user: "{{ agent_user }}"

    - name: Install Hermes Agent dependencies
      command: "{{ agent_home }}/.cargo/bin/uv pip install -e {{ install_dir }}"
      environment:
        VIRTUAL_ENV: "{{ venv_dir }}"
      become_user: "{{ agent_user }}"

    - name: Setup systemd service for Hermes Gateway
      template:
        src: hermes-gateway.service.j2
        dest: /etc/systemd/system/hermes-gateway-{{ agent_user }}.service
      notify: restart hermes-gateway

  handlers:
    - name: restart hermes-gateway
      systemd:
        name: hermes-gateway-{{ agent_user }}
        state: restarted
        daemon_reload: yes
```