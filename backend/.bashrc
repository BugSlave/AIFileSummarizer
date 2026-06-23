gcm() {
  local branch="${1}"  # optional: gcm main, gcm feature/xyz

  local diff=$(git diff --cached)
  if [ -z "$diff" ]; then
    echo "❌ Kuch staged nahi. Pehle git add karo."
    return 1
  fi

  echo "🤖 AI commit message generate kar raha hai..."
  local message=$(echo "$diff" | ollama run gemma4:31b-cloud \
    "Write exactly one git commit message for this diff.
     Use conventional commits format: type(scope): description
     Types: feat, fix, docs, refactor, test, chore
     Only return the commit message. Nothing else. No explanation." \
    2>/dev/null | head -1)

  if [ -z "$message" ]; then
    echo "❌ Message generate nahi hua. Ollama chal raha hai?: ollama serve"
    return 1
  fi

  echo ""
  echo "✅ Generated: $message"

  # If branch given, show what will happen
  if [ -n "$branch" ]; then
    local remote_branch=$(git rev-parse --abbrev-ref --symbolic-full-name "@{u}" 2>/dev/null || echo "origin/$branch")
    echo "📤 Push: $(git remote get-url origin) → $branch"
  fi

  echo ""
  printf "Commit%s karo? (y/n): " "${branch:+ aur push}"
  read confirm

  if [ "$confirm" = "y" ]; then
    git commit -m "$message"
    echo "🎉 Committed!"

    if [ -n "$branch" ]; then
      echo "📤 Pushing to origin/$branch..."
      git push origin "HEAD:$branch"
      if [ $? -eq 0 ]; then
        echo "✅ Pushed!"
      else
        echo "❌ Push fail hua. Check karo: git push manually."
      fi
    fi
  else
    echo "Cancelled."
  fi
}