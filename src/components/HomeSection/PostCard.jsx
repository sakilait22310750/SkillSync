import React, { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import {
  ChatBubbleOutline,
  Repeat,
  FavoriteBorder,
  Favorite,
  Share,
  Edit,
  MoreVert,
  Close
} from "@mui/icons-material";
import {
  likePost,
  unlikePost,
  deletePost,
  addComment,
  updatePost
} from "../../api";
import { useNavigate } from "react-router-dom";
import { IconButton, Menu, MenuItem, TextField } from "@mui/material";
import styled from "styled-components";

const PostCard = ({ post, user, refreshPosts }) => {
  const [isLiked, setIsLiked] = useState(post.likedBy.includes(user?.id));
  const [likeCount, setLikeCount] = useState(post.likesCount);
  const [showComments, setShowComments] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditPost = async () => {
    try {
      setIsSubmitting(true);
      await updatePost(post.id, editedContent);
      await refreshPosts();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Failed to update post");
    } finally {
      setIsSubmitting(false);
      handleMenuClose();
    }
  };

  const handleLike = async () => {
    try {
      if (isLiked) {
        await unlikePost(post.id);
        setLikeCount(likeCount - 1);
      } else {
        await likePost(post.id);
        setLikeCount(likeCount + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost(post.id);
        refreshPosts();
      } catch (error) {
        console.error("Error deleting post:", error);
      } finally {
        handleMenuClose();
      }
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addComment(post.id, commentContent);
      setCommentContent("");
      refreshPosts();
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors">
      <div className="flex space-x-3">
        <Avatar 
          src={post.user?.photo || "https://via.placeholder.com/150"} 
          alt={post.user?.name}
          onClick={() => navigate(`/profile/${post.userId}`)}
          className="cursor-pointer hover:opacity-80"
          sx={{ width: 48, height: 48 }}
        />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-1">
              <span className="font-bold hover:underline cursor-pointer">
                {post.user?.name}
              </span>
              <span className="text-gray-500 text-sm">
                @{post.user?.email.split('@')[0]}
              </span>
              <span className="text-gray-500 text-sm">•</span>
              <span className="text-gray-500 text-sm">
                {new Date(post.createdAt).toLocaleString()}
              </span>
            </div>
            
            {user?.id === post.userId && (
              <>
                <IconButton onClick={handleMenuOpen} size="small">
                  <MoreVert fontSize="small" />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={() => {
                    setIsEditing(true);
                    setEditedContent(post.content);
                    handleMenuClose();
                  }}>
                    <Edit fontSize="small" className="mr-2" />
                    Edit Post
                  </MenuItem>
                  <MenuItem onClick={handleDelete}>
                    <span className="text-red-500">Delete Post</span>
                  </MenuItem>
                </Menu>
              </>
            )}
          </div>

          {isEditing ? (
            <div className="mt-2 mb-3">
              <TextField
                fullWidth
                multiline
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                variant="outlined"
                size="small"
              />
              <div className="flex justify-end space-x-2 mt-2">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleEditPost}
                  disabled={isSubmitting || !editedContent.trim()}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-1 mb-2 text-gray-800">{post.content}</p>
          )}
          
          {post.imageUrls?.length > 0 && (
            <div className={`grid gap-2 mb-3 ${
              post.imageUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
            }`}>
              {post.imageUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={`http://localhost:4043${url}`}
                    alt={`Post ${post.id} image ${index}`}
                    className="rounded-lg object-cover w-full h-48 hover:opacity-90 transition-opacity"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/500x300?text=Image+Not+Available";
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {post.videoUrl && (
            <div className="mb-3">
              <video 
                src={`http://localhost:4043${post.videoUrl}`}
                controls 
                className="rounded-lg w-full"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/500x300?text=Video+Not+Available";
                }}
              />
            </div>
          )}
          
          {/* Post actions */}
          <div className="flex justify-between mt-3 text-gray-500">
            <button 
              className="flex items-center space-x-1 hover:text-blue-500"
              onClick={() => setShowComments(!showComments)}
            >
              <ChatBubbleOutline fontSize="small" />
              <span>{post.comments?.length || 0}</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-green-500">
              <Repeat fontSize="small" />
            </button>
            <button 
              className="flex items-center space-x-1 hover:text-red-500"
              onClick={handleLike}
            >
              {isLiked ? (
                <Favorite fontSize="small" color="error" />
              ) : (
                <FavoriteBorder fontSize="small" />
              )}
              <span>{likeCount}</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-blue-500">
              <Share fontSize="small" />
            </button>
          </div>
          
          {/* Comments section */}
          {showComments && (
            <div className="mt-3 space-y-3">
              {post.comments?.map((comment, index) => (
                <div key={index} className="flex space-x-2">
                  <Avatar 
                    src={comment.user?.photo || "https://via.placeholder.com/150"} 
                    sx={{ width: 32, height: 32 }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-1">
                      <span className="font-semibold text-sm">{comment.user?.name}</span>
                      <span className="text-gray-500 text-xs">
                        @{comment.user?.email.split('@')[0]}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
              
              {/* Styled comment form */}
              <StyledCommentForm>
                <form onSubmit={handleAddComment} className="form">
                  <div className="form-group">
                    <label htmlFor="comment">Add a comment</label>
                    <textarea 
                      id="comment"
                      name="comment"
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      rows={3}
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    className="form-submit-btn"
                    disabled={isSubmitting || !commentContent.trim()}
                  >
                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </form>
              </StyledCommentForm>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StyledCommentForm = styled.div`
  margin-top: 16px;
  background: linear-gradient(#212121, #212121) padding-box,
              linear-gradient(145deg, transparent 35%,#e81cff, #40c9ff) border-box;
  border: 2px solid transparent;
  padding: 16px;
  font-size: 14px;
  font-family: inherit;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box;
  border-radius: 12px;

  .form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .form-group label {
    display: block;
    margin-bottom: 4px;
    color: #717171;
    font-weight: 600;
    font-size: 12px;
  }

  .form-group textarea {
    width: 100%;
    padding: 8px 12px;
    border-radius: 6px;
    resize: none;
    color: #fff;
    border: 1px solid #414141;
    background-color: transparent;
    font-family: inherit;
    min-height: 80px;
  }

  .form-group textarea:focus {
    outline: none;
    border-color: #e81cff;
  }

  .form-submit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: inherit;
    color: #717171;
    font-weight: 600;
    background: #313131;
    border: 1px solid #414141;
    padding: 8px 16px;
    font-size: 14px;
    gap: 8px;
    cursor: pointer;
    border-radius: 6px;
    align-self: flex-start;
  }

  .form-submit-btn:hover {
    background-color: #fff;
    border-color: #fff;
  }

  .form-submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .form-submit-btn:active {
    scale: 0.95;
  }
`;

export default PostCard;